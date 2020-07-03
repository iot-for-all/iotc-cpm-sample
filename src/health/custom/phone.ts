import { BleDevice } from "../ble";
import { IHealthDevice } from "../../models";
import { Characteristic } from "react-native-ble-plx";
import { ManufacturerMap } from "../manufacterMap";

export class PhonePeripheralDevice extends BleDevice implements IHealthDevice {
    getValue(characteristic: Characteristic) {
        if (characteristic.value == null) {
            return null;
        }
        const val = Buffer.from(characteristic.value, 'base64');

        if (characteristic.uuid.toLowerCase() === '00002a1c-0000-1000-8000-00805f9b34fb') {
            if (val.length === 5) {
                return 0;
            }
        }
        const intval = val.readInt8();
        return intval;
    }
}

ManufacturerMap.addManufacturer('phone', ['0000180f-0000-1000-8000-00805f9b34fb', '00001809-0000-1000-8000-00805f9b34fb'], PhonePeripheralDevice);