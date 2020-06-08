import { IHealthhManager, IHealthDevice, IHealthItem, isHealthService, DataAvailableCallback } from "../models";
import { BleManager as NativeManager, State, Device, Subscription } from 'react-native-ble-plx';
import { Platform, PermissionsAndroid } from "react-native";

export class UnsupportedError extends Error {

}

export class PoweredOffError extends Error {

}

export class BleManager implements IHealthhManager {


    private constructor(private nativeManager: NativeManager) {

    }

    static async GetManager(): Promise<BleManager> {
        return new Promise<BleManager>(async (resolve, reject) => {
            const native = new NativeManager();
            if (Platform.OS === 'android') {
                const granted = await PermissionsAndroid.request(
                    PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
                    {
                        title: 'Bluetooth Permission',
                        message: `Application would like to use bluetooth and location permissions`,
                        buttonNeutral: 'Ask Me Later',
                        buttonNegative: 'Cancel',
                        buttonPositive: 'OK',
                    }
                );
                if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
                    reject(new Error('Bluetooth permissions not granted'));
                }
            }
            let nativeState = await native.state();
            if (nativeState === State.PoweredOn) {
                console.log('Bluetooth on');
                resolve(new BleManager(native));
            }
            if (nativeState === State.Unsupported) {
                console.log(`Bluetooth unsupported`);
                reject(new UnsupportedError('Bluetooth not supported in this device'));
            }
            else if (nativeState === State.PoweredOff) {
                console.log('Bluetooth off');
                reject(new PoweredOffError('Bluetooth disabled on the device'));
            }
            else {
                const sub = native.onStateChange((state) => {
                    console.log(`Current state: ${state}`);
                    if (state === 'PoweredOn') {
                        sub.remove();
                        resolve(new BleManager(native));
                    }
                    else if (state === 'Unknown') {
                        return;
                    }
                    else {
                        reject();
                    }
                }, true);
                await native.state();
            }
        });
    }
    startScan(onDeviceFound: (device: IHealthDevice) => void): void {
        this.nativeManager.startDeviceScan(null, null, (error, device) => {
            if (error || !device) {
                // TODO:handle error
                return;
            }
            onDeviceFound(new BleDevice(device))
        });
    }
    stopScan(): void {
        this.nativeManager.stopDeviceScan();
    }
    async connect(deviceId: string): Promise<IHealthDevice> {
        const dev = await this.nativeManager.connectToDevice(deviceId);
        return new BleDevice(dev);
    }
}

export class BleDevice implements IHealthDevice {
    public paired: boolean
    public id: string;
    public name: string;
    public items: IHealthItem[] | undefined;
    public connected: boolean;

    /**
    * keeps track of the enabled notifications
    */
    private enabled: { [itemId: string]: Subscription };

    constructor(private nativeDevice: Device) {
        this.id = nativeDevice.id;
        this.name = nativeDevice.name ? nativeDevice.name : nativeDevice.id;
        this.paired = true;
        this.enabled = {};
        this.connected = false;
    }

    private async enableItem(item: IHealthItem, status: boolean, onDataAvailable?: DataAvailableCallback): Promise<boolean> {
        if (!status) {
            if (this.enabled[item.id]) {
                this.enabled[item.id].remove();
                delete this.enabled[item.id];
            }
            item.enabled = false;
            return false;
        }
        if (!onDataAvailable) {
            throw new Error('A listener must be specified when enabling notifications for an item');
        }
        this.enabled[item.id] = this.nativeDevice.monitorCharacteristicForService(item.parentId as string, item.id, (error, characteristic) => {
            if (error || !characteristic) {
                // TODO: handle error
                return;
            }
            onDataAvailable(item.id, characteristic.value, item.name);
        });
        item.enabled = true;
        return true;
    }

    async fetch(): Promise<void> {
        if (!this.connected) {
            throw new Error('Device not connected');
        }
        this.items = (await Promise.all((await this.nativeDevice.services()).map(async (service) =>
            await Promise.all((await service.characteristics()).map<IHealthItem>(characteristic => {
                let c: any = {
                    id: characteristic.uuid,
                    parentId: characteristic.serviceUUID,
                    name: characteristic.uuid,
                    enabled: false,
                    value: undefined
                };
                c.enable = function (this: BleDevice, status: boolean, onDataAvailable?: DataAvailableCallback) {
                    return this.enableItem(c, status, onDataAvailable);
                }.bind(this);
                return c;
            }, this)), this
        ))).reduce((a, b) => (a.concat(b)))
    }


    async disconnect() {
        // loop through listeners
        Object.keys(this.enabled).forEach(enabledItem => {
            this.enabled[enabledItem].remove();
            delete this.enabled[enabledItem];
        });
        // disconnect
        await this.nativeDevice.cancelConnection();
    }

}