import {
  IHealthDevice,
  IHealthItem,
  IHealthManager,
  DeviceType,
  isHealthService,
} from '../models';
import {EventEmitter} from 'events';
import {DATA_AVAILABLE_EVENT} from './ble';

export class SimulatedHealthManager implements IHealthManager {
  private devices: IHealthDevice[] = [
    new SmartKneeBraceDevice('00:11:22:33:44:55', 'Smart Knee Brace 1'),
    new SmartKneeBraceDevice('A0:39:42:FD:BA:AB', 'Smart Knee Brace 2'),
    new SmartKneeBraceDevice('0D:44:21:FF:37:AA', 'Smart Knee Brace 3'),
    new SmartVitalsPatchDevice('AB:8A:60:D3:83:16', 'Smart Vitals Patch 1'),
    new SmartVitalsPatchDevice('CE:2B:88:1A:32:03', 'Smart Vitals Patch 2'),
    new SmartVitalsPatchDevice('32:83:74:AA:CC:33', 'Smart Vitals Patch 3'),
  ];

  /**
   * hold the interval id for the current scan in progress
   */
  private currentScan: number | undefined;
  startScan(onDeviceFound: (device: IHealthDevice) => void): void {
    let count = 0;
    // @ts-ignore
    // sometimes setInterval gets typings from node instead of react-native
    this.currentScan = setInterval(
      function (this: SimulatedHealthManager) {
        if (count === this.devices.length) {
          return;
        }
        onDeviceFound(this.devices[count]);
        count++;
      }.bind(this),
      400,
    );
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

export class SimulatedDevice implements Omit<IHealthDevice, 'fetch'> {
  public paired: boolean;
  public connected: boolean;
  public simulated: boolean;
  public items: IHealthItem[] | undefined;
  private eventEmitter: EventEmitter;
  public type: DeviceType = 'simulated';
  /**
   * keeps track of the running simulated items.
   * The value of each item represents the interval Id to stop simulation
   * through clearInterval
   */
  private enabled: {[itemId: string]: number};

  constructor(public id: string, public name: string) {
    this.simulated = true;
    this.paired = true;
    this.enabled = {};
    this.connected = false;
    this.eventEmitter = new EventEmitter();
  }
  addListener(
    eventType: string,
    listener: (...args: any[]) => any,
    context?: any,
  ) {
    this.eventEmitter.addListener(eventType, listener);
  }
  removeListener(eventType: string, listener: (...args: any[]) => any) {
    this.eventEmitter.removeListener(eventType, listener);
  }

  protected async enableItem(
    item: IHealthItem,
    status: boolean,
  ): Promise<boolean> {
    if (status) {
      if (this.enabled[item.id]) {
        return true;
      }
      // @ts-ignore
      // sometimes setInterval gets typings from node instead of react-native
      this.enabled[item.id] = setInterval(
        function (this: SimulatedDevice) {
          // if (onDataAvailable) {
          //     onDataAvailable(item.id, Math.floor(Math.random() * 40), item.name);
          // }
          this.eventEmitter.emit(DATA_AVAILABLE_EVENT, {
            itemId: item.id,
            value: item.getData
              ? item.getData()
              : Math.floor(Math.random() * 40),
            itemName: item.name,
          });
        }.bind(this),
        Math.floor(Math.random() * 1000) + 4000,
      );
      item.enabled = true;
      return true;
    } else {
      if (this.enabled[item.id]) {
        clearInterval(this.enabled[item.id]);
        delete this.enabled[item.id];
      }
      item.enabled = false;
      return false;
    }
  }

  protected async fetch() {
    let fetchedItems: any[] = [
      {
        id: '00002A1C-0000-1000-8000-00805f9b34fb',
        name: 'Temperature',
        parentId: '00001809-0000-1000-8000-00805f9b34fb',
        enabled: isHealthService('00001809-0000-1000-8000-00805f9b34fb'),
        value: undefined,
      },
      {
        id: '00002A37-0000-1000-8000-00805f9b34fb',
        parentId: '0000180D-0000-1000-8000-00805f9b34fb',
        name: 'Heart Rate',
        enabled: isHealthService('0000180D-0000-1000-8000-00805f9b34fb'),
        value: undefined,
      },
      {
        id: '00002A35-0000-1000-8000-00805f9b34fb',
        name: 'Blood pressure',
        parentId: '00001810-0000-1000-8000-00805f9b34fb',
        enabled: isHealthService('00001810-0000-1000-8000-00805f9b34fb'),
        value: undefined,
      },
    ];
    fetchedItems.map(i => {
      i.enable = function (this: SimulatedDevice, status: boolean) {
        return this.enableItem(i, status);
      }.bind(this);
    }, this);
    this.items = fetchedItems;
    this.items.forEach(item => {
      if (item.enabled) {
        item.enable(true);
      }
    });
  }
  public async disconnect() {
    // loop through listeners
    if (this.enabled && this.items) {
      Object.keys(this.enabled).forEach(enabledItem => {
        clearInterval(this.enabled[enabledItem]);
        const currentItem = (this.items as IHealthItem[]).find(
          i => i.id === enabledItem,
        );
        if (currentItem) {
          currentItem.enabled = false;
        }
        delete this.enabled[enabledItem];
      }, this);
      return Promise.resolve();
    }
    this.eventEmitter.removeAllListeners(DATA_AVAILABLE_EVENT);
  }
}

export class SmartKneeBraceDevice
  extends SimulatedDevice
  implements IHealthDevice
{
  public async fetch() {
    let fetchedItems: any[] = [
      {
        id: 'Acceleration',
        name: 'Acceleration',
        parentId: '00001809-0000-1000-8000-00805f9b34fb',
        enabled: isHealthService('00001809-0000-1000-8000-00805f9b34fb'),
        value: undefined,
        getData: function () {
          return {
            x: Math.floor(Math.random() * 40),
            y: Math.floor(Math.random() * 40),
            z: Math.floor(Math.random() * 40),
          };
        },
      },
      {
        id: 'RangeOfMotion',
        parentId: '0000180D-0000-1000-8000-00805f9b34fb',
        name: 'Range of motion',
        enabled: isHealthService('0000180D-0000-1000-8000-00805f9b34fb'),
        value: undefined,
        getData: function () {
          return Math.floor(Math.random() * 40);
        },
      },
      {
        id: 'KneeBend',
        name: 'Knee bend',
        parentId: '00001810-0000-1000-8000-00805f9b34fb',
        enabled: isHealthService('00001810-0000-1000-8000-00805f9b34fb'),
        value: undefined,
        getData: function () {
          return Math.floor(Math.random() * 40);
        },
      },
      {
        id: 'DeviceTemperature',
        name: 'Device Temperature',
        parentId: '00001810-0000-1000-8000-00805f9b34fb',
        enabled: isHealthService('00001810-0000-1000-8000-00805f9b34fb'),
        value: undefined,
        getData: function () {
          return Math.floor(Math.random() * 40);
        },
      },
      {
        id: 'BatteryLevel',
        name: 'Battery Level',
        parentId: '00001810-0000-1000-8000-00805f9b34fb',
        enabled: isHealthService('00001810-0000-1000-8000-00805f9b34fb'),
        value: undefined,
        getData: function () {
          return Math.floor(Math.random() * 40);
        },
      },
    ];
    fetchedItems.map(i => {
      i.enable = function (this: SmartKneeBraceDevice, status: boolean) {
        return this.enableItem(i, status);
      }.bind(this);
    }, this);
    this.items = fetchedItems;
    this.items.forEach(item => {
      if (item.enabled) {
        item.enable(true);
      }
    });
  }
}

export class SmartVitalsPatchDevice
  extends SimulatedDevice
  implements IHealthDevice
{
  public async fetch() {
    let fetchedItems: any[] = [
      {
        id: 'HeartRate',
        name: 'Heart Rate',
        parentId: '00001809-0000-1000-8000-00805f9b34fb',
        enabled: isHealthService('00001809-0000-1000-8000-00805f9b34fb'),
        value: undefined,
        getData: function () {
          return Math.floor(Math.random() * 40);
        },
      },
      {
        id: 'RespiratoryRate',
        parentId: '0000180D-0000-1000-8000-00805f9b34fb',
        name: 'Respiratory Rate',
        enabled: isHealthService('0000180D-0000-1000-8000-00805f9b34fb'),
        value: undefined,
        getData: function () {
          return Math.floor(Math.random() * 40);
        },
      },
      {
        id: 'HeartRateVariability',
        name: 'Heart rate variability',
        parentId: '00001810-0000-1000-8000-00805f9b34fb',
        enabled: isHealthService('00001810-0000-1000-8000-00805f9b34fb'),
        value: undefined,
        getData: function () {
          return Math.floor(Math.random() * 40);
        },
      },
      {
        id: 'BodyTemperature',
        name: 'Body temperature',
        parentId: '00001810-0000-1000-8000-00805f9b34fb',
        enabled: isHealthService('00001810-0000-1000-8000-00805f9b34fb'),
        value: undefined,
        getData: function () {
          return Math.random() * 40;
        },
      },
      {
        id: 'DeviceTemperature',
        name: 'Device Temperature',
        parentId: '00001810-0000-1000-8000-00805f9b34fb',
        enabled: isHealthService('00001810-0000-1000-8000-00805f9b34fb'),
        value: undefined,
        getData: function () {
          return Math.random() * 40;
        },
      },
      {
        id: 'BatteryLevel',
        name: 'Battery Level',
        parentId: '00001810-0000-1000-8000-00805f9b34fb',
        enabled: isHealthService('00001810-0000-1000-8000-00805f9b34fb'),
        value: undefined,
        getData: function () {
          return Math.random() * 40;
        },
      },
    ];
    fetchedItems.map(i => {
      i.enable = function (this: SmartVitalsPatchDevice, status: boolean) {
        return this.enableItem(i, status);
      }.bind(this);
    }, this);
    this.items = fetchedItems;
    this.items.forEach(item => {
      if (item.enabled) {
        item.enable(true);
      }
    });
  }
}
