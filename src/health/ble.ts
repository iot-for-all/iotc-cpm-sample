import { IHealthManager, IHealthDevice, IHealthItem, DeviceType, isHealthService } from "../models";
import { BleManager as NativeManager, State, Device, Subscription, Characteristic } from 'react-native-ble-plx';
import { Platform, PermissionsAndroid } from "react-native";
import { EventEmitter } from 'events';
import { Buffer } from 'buffer';
import { ManufacturerMap } from "./manufacterMap";


export class UnsupportedError extends Error {

}

export class PoweredOffError extends Error {

}

export const DATA_AVAILABLE_EVENT = 'data_available';



export class BleManager implements IHealthManager {


    constructor(protected nativeManager: NativeManager) {

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
                    console.log(`Current Bluetooth Adapter state: ${state}`);
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
        this.nativeManager.startDeviceScan(null, null, async (error, device) => {
            if (error || !device) {
                return;
            }
            onDeviceFound(await getManufacturerDeviceFromId(device));
        });
    }
    stopScan(): void {
        this.nativeManager.stopDeviceScan();
    }
    async connect(deviceId: string): Promise<IHealthDevice> {
        const dev = await this.nativeManager.connectToDevice(deviceId);
        const discoveredDev = await dev.discoverAllServicesAndCharacteristics();
        await discoveredDev.services();
        const healthDev = await getManufacturerDeviceFromId(discoveredDev);
        healthDev.connected = true;
        return healthDev;
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

    protected getValue(characteristic: Characteristic): number | null {
        if (characteristic.value == null) {
            return null;
        }
        const val = Buffer.from(characteristic.value, 'base64');
        if (val.length === 1) {
            const intval = val.readInt8();
            return intval;
        }
        else if (val.length === 4) {
            return new DataView(val.buffer).getFloat32(0);
        }
        return +val;
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
                    enabled: isHealthService(characteristic.serviceUUID),
                    value: undefined
                };
                c.enable = function (this: BleDevice, status: boolean) {
                    return this.enableItem(c, status);
                }.bind(this);
                return c;
            }, this)), this
        ))).reduce((a, b) => (a.concat(b)))

        this.items.forEach(item => {
            if (item.enabled) {
                item.enable(true);
            }
        });
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



async function getManufacturerDeviceFromId(nativeDevice: Device): Promise<IHealthDevice> {
    let custom = null;
    if (nativeDevice.serviceUUIDs) {
        ManufacturerMap.getManufacturers().forEach(manId => {
            const ids = ManufacturerMap.getManufacturerIds(manId);
            if (!ids) {
                return;
            }
            if (ids.filter(id => nativeDevice.serviceUUIDs?.includes(id)).length > 0) {
                const ctor = ManufacturerMap.getManufacturerConstructor(manId)
                if (!ctor) {
                    return;
                }
                custom = new ctor(nativeDevice);
            }
        });
    }
    if (custom) {
        return custom;
    }
    return new BleDevice(nativeDevice);
}