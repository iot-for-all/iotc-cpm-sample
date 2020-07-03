# Data Format
By default, the application only converts raw data to standard integers or floating point number using usual conversion from bytes.

For non-standard data formats or to add data pre-processing features you can add your own custom device implementation.

To enable a quick integration with custom devices, this sample is organized to support inheritance: it is sufficient to extend the BleDevice class and add the custom class to the ManufacturerMap.

The _getValue_ function must be implemented. It accepts a ble characteristic instance and returns a number.

health/custom/mydevice.ts
```ts
class MyDevice extends BleDevice implements IHealthDevice {
    getValue(characteristic: Characteristic) {
        if (characteristic.value == null) {
            return null;
        }
        const val = Buffer.from(characteristic.value, 'base64');

        const intval = val.readInt8();
        return intval;
    }
}

ManufacturerMap.addManufacturer('MyDevice', ['0000180f-0000-1000-8000-00805f9b34fb', '00001809-0000-1000-8000-00805f9b34fb'], MyDevice);
```

The BleManager will create specific device instances based on available services. A list of service ids must be provided to the Manufacturers Map in order to create the right device instance.

However multiple devices can provide the same service with different data format. To overcome this issue just create one custom virtual device and put separation logic into the _getValue_ function.

