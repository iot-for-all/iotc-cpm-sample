import { IHealthhManager, IHealthDevice, IHealthItem, DeviceType } from "../models";
import { BleManager as NativeManager, State, Device, Subscription, Characteristic } from 'react-native-ble-plx';
import { Platform, PermissionsAndroid } from "react-native";
import { EventEmitter } from 'events';


export class UnsupportedError extends Error {

}

export class PoweredOffError extends Error {

}

export const DATA_AVAILABLE_EVENT = 'data_available';
// export const ManufacterMap: {
//     [manufacterId: string]: {
//         ids: string[],
//         deviceCtr: any
//     }
// } = {
//     stmicro: {
//         ids: ['AABB'],
//         deviceCtr: STMDevice
//     }
// }

function getManufacterDeviceFromId(nativeDevice: Device): IHealthDevice {
    // Object.keys(ManufacterMap).forEach(manufacterId => {
    //     if (ManufacterMap[manufacterId].ids.includes(nativeDevice.id)) {
    //         return new ManufacterMap[manufacterId].deviceCtr(nativeDevice);
    //     }
    // });
    return new BleDevice(nativeDevice);
}

export class BleManager implements IHealthhManager {


    protected constructor(private nativeManager: NativeManager) {

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
                return;
            }
            onDeviceFound(getManufacterDeviceFromId(device));
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
    private eventEmitter: EventEmitter
    public type: DeviceType = 'real';

    /**
    * keeps track of the enabled notifications
    */
    protected enabled: { [itemId: string]: Subscription };

    constructor(protected nativeDevice: Device) {
        this.id = nativeDevice.id;
        this.name = nativeDevice.name ? nativeDevice.name : nativeDevice.id;
        this.paired = true;
        this.enabled = {};
        this.connected = false;
        this.eventEmitter = new EventEmitter();
    }

    addListener(eventType: string, listener: (...args: any[]) => any, context?: any) {
        this.eventEmitter.addListener(eventType, listener)
    }
    removeListener(eventType: string, listener: (...args: any[]) => any) {
        this.eventEmitter.removeListener(eventType, listener);
    }

    private async enableItem(item: IHealthItem, status: boolean): Promise<boolean> {
        if (!status) {
            if (this.enabled[item.id]) {
                this.enabled[item.id].remove();
                delete this.enabled[item.id];
            }
            item.enabled = false;
            return false;
        }
        this.enabled[item.id] = this.nativeDevice.monitorCharacteristicForService(item.parentId as string, item.id, (error, characteristic) => {
            if (error || !characteristic) {
                return;
            }
            this.eventEmitter.emit(DATA_AVAILABLE_EVENT, { itemId: item.id, value: this.getValue(characteristic), itemName: item.name });
        });
        item.enabled = true;
        return true;
    }

    protected getValue(characteristic: Characteristic): string | null {
        return characteristic.value;
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
                c.enable = function (this: BleDevice, status: boolean) {
                    return this.enableItem(c, status);
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
        // remove all data listeners
        this.eventEmitter.removeAllListeners(DATA_AVAILABLE_EVENT);

        // disconnect
        await this.nativeDevice.cancelConnection();
    }

}