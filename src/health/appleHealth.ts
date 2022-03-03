import {
  IHealthManager,
  IHealthDevice,
  IHealthItem,
  DeviceType,
} from '../models';
import AppleHealthKit, {
  HealthKitPermissions,
} from 'react-native-health'
import {NativeAppEventEmitter} from 'react-native';
import {camelToName} from '../utils';
import {HealthRealTimeData} from '../types';
import {DATA_AVAILABLE_EVENT} from './ble';
import {EventEmitter} from 'events';

const PERMS = AppleHealthKit.Constants.Permissions;
const OBSERVABLES = [
  PERMS.StepCount,
  PERMS.HeartRate,
  PERMS.DistanceWalkingRunning,
  PERMS.DistanceCycling,
  PERMS.BodyTemperature,
  PERMS.BloodPressureDiastolic,
  PERMS.BloodPressureSystolic,
];
const OPTIONS: HealthKitPermissions = {
  permissions: {
    read: OBSERVABLES,
    write: [],
  },
};

async function requestPermissions(): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    AppleHealthKit.isAvailable((err, result) => {
      if (err) {
        return reject(err);
      }
      return resolve();
    });
  });
}

export class AppleHealthManager implements IHealthManager {
  private device: IHealthDevice | null;
  constructor() {
    this.device = null;
  }

  startScan(onDeviceFound: (device: IHealthDevice) => void): void {
    // Use start scan to init
    requestPermissions().then(() => {
      AppleHealthKit.initHealthKit(OPTIONS, (err, results) => {
        if (err) {
          console.log(err);
          // throw err;
        }
        // AppleHealthKit.initStepCountObserver({}, () => {});

        // HealthKit.setObserver({type: HealthRealTimeData.Walking});
        // HealthKit.setObserver({type: HealthRealTimeData.Running});
        // HealthKit.setObserver({type: HealthRealTimeData.Cycling});
        this.device = new AppleHealthDevice('healthKit', 'Apple Health Kit');
        onDeviceFound(this.device);
      });
    });
  }
  stopScan(): void {
    return;
  }
  connect(deviceId: string): Promise<IHealthDevice> {
    return Promise.resolve(this.device as IHealthDevice);
  }
}

export class AppleHealthDevice implements IHealthDevice {
  public items: IHealthItem[] | undefined;
  public paired: boolean;
  public connected: boolean;
  private eventEmitter: EventEmitter;
  public type: DeviceType = 'platform';

  /**
   * keeps track of the subscribtions
   * The value of each item represents a listener for the event emitter.
   */
  private enabled: {
    [itemId: string]: number;
  };

  constructor(public id: string, public name: string) {
    this.paired = true;
    this.connected = false;
    this.enabled = {};
    this.eventEmitter = new EventEmitter();
    // NativeAppEventEmitter.addListener('change:steps', data => {
    //   AppleHealthKit.getStepCount({}, (err, result) => {
    //     if (err) {
    //       console.log(`Error from Apple HealthKit:\n${(err as any).message}`);
    //       return;
    //     }
    //     if (this.items) {
    //       let item = this.items.find(i => i.id === PERMS.StepCount);
    //       if (item) {
    //         item.value = result.value;
    //       }
    //     }
    //   });
    // });
    // NativeAppEventEmitter.addListener('observer', data => {
    //   console.log(`Observer: ${data}`);
    // });
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

  private async enableItem(
    item: IHealthItem,
    status: boolean,
  ): Promise<boolean> {
    if (status) {
      if (this.enabled[item.id]) {
        return true;
      }

      // get current value for the item

      let startDate = new Date();
      startDate.setDate(startDate.getDate() - 1);
      switch (item.id) {
        case PERMS.Steps:
        case PERMS.StepCount:
          try {
            item.value = await new Promise((resolve, reject) =>
            AppleHealthKit.getStepCount({}, (err, result) => {
                if (err) {
                  reject(
                    `Error from Apple HealthKit:\n${(err as any).message}`,
                  );
                } else {
                  resolve(result.value);
                }
              }),
            );
          } catch (e) {
            // steps not available for today. Let's put 0
            item.value = 0;
          }
          break;
        case PERMS.HeartRate:
          item.value = await new Promise(r =>
            AppleHealthKit.getHeartRateSamples(
              {startDate: startDate.toISOString()},
              (err, result) => {
                if (result.length > 0) {
                  r(result[result.length - 1].value);
                } else r(undefined);
              },
            ),
          );
          break;
        case PERMS.BodyTemperature:
          item.value = await new Promise(r =>
            AppleHealthKit.getBodyTemperatureSamples(
              {startDate: startDate.toISOString()},
              (err, result) => {
                if (result.length > 0) {
                  r(result[result.length - 1].value);
                } else r(undefined);
              },
            ),
          );
          break;
        case PERMS.BloodPressureDiastolic:
          item.value = await new Promise(r =>
            AppleHealthKit.getBloodPressureSamples(
              {startDate: startDate.toISOString()},
              (err, result) => {
                if (result.length > 0) {
                  r(result[result.length - 1].bloodPressureDiastolicValue);
                } else r(undefined);
              },
            ),
          );
          break;
        case PERMS.BloodPressureSystolic:
          item.value = await new Promise(r =>
            AppleHealthKit.getBloodPressureSamples(
              {startDate: startDate.toISOString()},
              (err, result) => {
                if (result.length > 0) {
                  r(result[result.length - 1].bloodPressureSystolicValue);
                } else r(undefined);
              },
            ),
          );
          break;
        default:
          item.value = 0;
      }

      // @ts-ignore
      // sometimes setInterval gets typings from node instead of react-native
      this.enabled[item.id] = setInterval(() => {
        if (item.value != undefined || item.value != null) {
          this.eventEmitter.emit(DATA_AVAILABLE_EVENT, {
            itemId: item.id,
            value: item.value,
            itemName: item.name,
          });
        }
      }, 5000);
      item.enabled = true;
      return true;
    } else {
      if (this.enabled[item.id]) {
        delete this.enabled[item.id];
      }
      item.enabled = false;
      return false;
    }
  }

  public async fetch() {
    let fetchedItems: any[] = Object.keys(HealthRealTimeData)
      .concat(OBSERVABLES)
      .map(perm => ({
        id: perm,
        name: camelToName(perm),
        enabled: true,
        value: undefined,
      }));
    fetchedItems.map(i => {
      i.enable = function (this: AppleHealthDevice, status: boolean) {
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
    // remove all data listeners
    this.eventEmitter.removeAllListeners(DATA_AVAILABLE_EVENT);
  }
}
