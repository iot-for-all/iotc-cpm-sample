import { BleDevice, BleManager } from "./ble";
import { IHealthDevice, IHealthItem, DataAvailableCallback, IHealthhManager } from "../models";
import { Characteristic, Device } from "react-native-ble-plx";

export class STMManager extends BleManager implements IHealthhManager {
    protected getHealthDevice(device: Device) {
        return new STMDevice(device);
    }
}

export class STMDevice extends BleDevice implements IHealthDevice {

    protected getValue(characteristic: Characteristic) {
        return 'stm';
    }
}