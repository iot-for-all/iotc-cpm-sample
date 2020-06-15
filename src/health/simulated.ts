import { IHealthDevice, IHealthItem, IHealthhManager, DataAvailableCallback } from "../models";

export class SimulatedHealthManager implements IHealthhManager {

    private devices: IHealthDevice[] = [
        new SimulatedDevice('00:11:22:33:44:55', 'Device1'),
        new SimulatedDevice('A0:39:42:FD:BA:AB', 'Device2'),
        new SimulatedDevice('0D:44:21:FF:37:AA', 'Device3'),
        new SimulatedDevice('AB:8A:60:D3:83:16', 'Device4'),
        new SimulatedDevice('CE:2B:88:1A:32:03', 'Device5'),
        new SimulatedDevice('32:83:74:AA:CC:33', 'Device6'),
    ];

    /**
     * hold the interval id for the current scan in progress
     */
    private currentScan: number | undefined;
    startScan(onDeviceFound: (device: IHealthDevice) => void): void {
        let count = 0
        // @ts-ignore
        // sometimes setInterval gets typings from node instead of react-native
        this.currentScan = setInterval(function (this: SimulatedHealthManager) {
            if (count === this.devices.length) {
                return;
            }
            onDeviceFound(this.devices[count])
            count++;
        }.bind(this), 400);
    }
    stopScan(): void {
        if (this.currentScan) {
            clearInterval(this.currentScan);
        }
    }
    connect(deviceId: string): Promise<IHealthDevice> {
        const dev = this.devices.find(d => d.id === deviceId);
        if (!dev) {
            return Promise.reject();
        }
        dev.connected = true;
        return Promise.resolve(dev);
    }


}

export class SimulatedDevice implements IHealthDevice {
    public paired: boolean;
    public connected: boolean;
    public simulated: boolean;
    public items: IHealthItem[] | undefined;
    /**
     * keeps track of the running simulated items.
     * The value of each item represents the interval Id to stop simulation
     * through clearInterval
     */
    private enabled: { [itemId: string]: number };

    constructor(public id: string, public name: string) {
        this.simulated = true;
        this.paired = true;
        this.enabled = {};
        this.connected = false;
    }

    private async enableItem(item: IHealthItem, status: boolean, onDataAvailable?: DataAvailableCallback): Promise<boolean> {
        if (status) {
            if (this.enabled[item.id]) {
                return true;
            }
            // @ts-ignore
            // sometimes setInterval gets typings from node instead of react-native
            this.enabled[item.id] = setInterval(function () {
                if (onDataAvailable) {
                    onDataAvailable(item.id, Math.floor(Math.random() * 40), item.name);
                }
            }, 5000);
            item.enabled = true;
            return true;
        }
        else {
            if (this.enabled[item.id]) {
                clearInterval(this.enabled[item.id]);
                delete this.enabled[item.id];
            }
            item.enabled = false;
            return false;
        }
    }

    public async fetch() {
        let fetchedItems: any[] = [{
            id: '00002A1C-0000-1000-8000-00805f9b34fb',
            name: 'Temperature',
            parentId: '00001809-0000-1000-8000-00805f9b34fb',
            enabled: false,
            value: undefined
        },
        {
            id: '00002A37-0000-1000-8000-00805f9b34fb',
            parentId: '0000180D-0000-1000-8000-00805f9b34fb',
            name: 'Heart Rate',
            enabled: false,
            value: undefined
        },
        {
            id: '00002A35-0000-1000-8000-00805f9b34fb',
            name: 'Blood pressure',
            parentId: '00001810-0000-1000-8000-00805f9b34fb',
            enabled: false,
            value: undefined
        }];
        fetchedItems.map(i => {
            i.enable = function (this: SimulatedDevice, status: boolean, onDataAvailable?: DataAvailableCallback) {
                return this.enableItem(i, status, onDataAvailable);
            }.bind(this);
        }, this);
        this.items = fetchedItems;
    }
    public async disconnect() {
        // loop through listeners
        if (this.enabled && this.items) {
            Object.keys(this.enabled).forEach(enabledItem => {
                clearInterval(this.enabled[enabledItem]);
                const currentItem = (this.items as IHealthItem[]).find(i => i.id === enabledItem);
                if (currentItem) {
                    currentItem.enabled = false;
                }
                delete this.enabled[enabledItem];
            }, this);
            return Promise.resolve();
        }
    }

}

