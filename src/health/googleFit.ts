import {
  IHealthManager,
  IHealthDevice,
  IHealthItem,
  DeviceType,
} from '../models';
import GoogleFit, { Scopes } from 'react-native-google-fit';
import { dottedToName, snakeToName } from '../utils';
import { PERMISSIONS, request, RESULTS } from 'react-native-permissions';
import { GoogleFitBloodPressureResult, GoogleFitStepResult } from '../types';
import { DATA_AVAILABLE_EVENT } from './ble';
import { EventEmitter } from 'events';
import { Platform } from 'react-native';

const SCOPES = [
  Scopes.FITNESS_ACTIVITY_READ,
  Scopes.FITNESS_BODY_READ,
  Scopes.FITNESS_BODY_TEMPERATURE_READ,
  Scopes.FITNESS_BLOOD_PRESSURE_READ,
  Scopes.FITNESS_ACTIVITY_WRITE,
  Scopes.FITNESS_HEART_RATE_READ,
  Scopes.FITNESS_HEART_RATE_WRITE,
  Scopes.FITNESS_BLOOD_PRESSURE_WRITE,
  Scopes.FITNESS_BLOOD_GLUCOSE_READ,
  Scopes.FITNESS_BLOOD_GLUCOSE_WRITE,
];
enum GOOGLE_ITEMS {
  STEPS = 'Steps',
  BLOOD_PRESSURE_SYSTOLIC = 'Blood Pressure Systolic',
  BLOOD_PRESSURE_DIASTOLIC = 'Blood Pressure Diastolic',
}

export class GoogleFitManager implements IHealthManager {
  private device: IHealthDevice | null;
  constructor() {
    this.device = null;
  }

  startScan(onDeviceFound: (device: IHealthDevice) => void): void {
    (async () => {
      try {
        await GoogleFit.checkIsAuthorized();
      }
      catch (er) {
        console.log(er);
      }
      let granted = await request(
        PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
        {
          title: 'Location Permission',
          message: `Application would like to use location permissions for distance calculation`,
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        },
      );

      if (granted !== RESULTS.GRANTED) {
        throw new Error('Bluetooth permissions not granted');
      }
      if (Platform.Version > 28) {
        granted = await request(
          PERMISSIONS.ANDROID.ACTIVITY_RECOGNITION,
          {
            title: 'Activity Permission',
            message: `Application would like to use activity permissions.`,
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          },
        );

        if (granted !== RESULTS.GRANTED) {
          throw new Error('Activity permissions not granted');
        }
      }
      if (!GoogleFit.isAuthorized) {
        try {
          const authResult = await GoogleFit.authorize({ scopes: SCOPES });
          if (authResult.success) {
            GoogleFit.startRecording(
              data => {
                if (data.recording) {
                  this.device = new GoogleFitDevice('googleFit', 'Google Fit');
                  onDeviceFound(this.device);
                }
              },
              ['step', 'distance', 'activity'],
            );
          }
          else {
            console.log(authResult);
            throw new Error(
              `Google Fit Authorization denied: ${authResult.message}`,
            );
          }
        } catch (err) {
          console.log(err);
        }
      }
      else {
        if (this.device) {
          onDeviceFound(this.device);
        }
      }
    })();
  }
  stopScan(): void {
    return;
  }
  connect(deviceId: string): Promise<IHealthDevice> {
    return Promise.resolve(this.device as IHealthDevice);
  }
}

export class GoogleFitDevice implements IHealthDevice {
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
    GoogleFit.observeSteps(data => {
      if (this.enabled[GOOGLE_ITEMS.STEPS]) {
        if (this.items) {
          const step = this.items.find(i => i.id === GOOGLE_ITEMS.STEPS);
          if (step) {
            step.value += (data as any).steps;
          }
        }
      }
    });
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

      // @ts-ignore
      // sometimes setInterval gets typings from node instead of react-native
      this.enabled[item.id] = setInterval(async () => {
        if (item.value) {
          this.eventEmitter.emit(DATA_AVAILABLE_EVENT, {
            itemId: item.id,
            value: item.value,
            itemName: item.name,
          });
        } else {
          // get current value for the item

          let startDate = new Date();
          startDate.setDate(startDate.getDate() - 1);
          let results;
          switch (item.id) {
            case GOOGLE_ITEMS.STEPS:
              results = (await GoogleFit.getDailyStepCountSamples({
                startDate: startDate.toISOString(),
                endDate: new Date().toISOString(),
              })) as GoogleFitStepResult[];
              results.forEach(result => {
                if (result.steps && result.steps.length > 0) {
                  item.value = result.steps[result.steps.length - 1].value;
                }
              });
              this.eventEmitter.emit(DATA_AVAILABLE_EVENT, {
                itemId: item.id,
                value: item.value ?? 0,
                itemName: item.name,
              });
              break;
            case GOOGLE_ITEMS.BLOOD_PRESSURE_SYSTOLIC:
              results = (await GoogleFit.getBloodPressureSamples({
                startDate: startDate.toISOString(),
                endDate: new Date().toISOString(),
              })) as GoogleFitBloodPressureResult[];
              results.forEach(result => {
                if (result.systolic) {
                  item.value = result.systolic
                }
              });
              this.eventEmitter.emit(DATA_AVAILABLE_EVENT, {
                itemId: item.id,
                value: item.value ?? 0,
                itemName: item.name,
              });
              break;
            case GOOGLE_ITEMS.BLOOD_PRESSURE_DIASTOLIC:
              results = (await GoogleFit.getBloodPressureSamples({
                startDate: startDate.toISOString(),
                endDate: new Date().toISOString(),
              })) as GoogleFitBloodPressureResult[];
              results.forEach(result => {
                if (result.diastolic) {
                  item.value = result.diastolic
                }
              });
              this.eventEmitter.emit(DATA_AVAILABLE_EVENT, {
                itemId: item.id,
                value: item.value ?? 0,
                itemName: item.name,
              });
              break;
            default:
              break;
          }
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
    let fetchedItems: any[] = Object.keys(GOOGLE_ITEMS).map(perm => {
      // const name = perm.replace(GOOGLE_PREFIX, '').replace('read', '');
      const name = (<any>GOOGLE_ITEMS)[perm];
      return {
        id: name,
        name: snakeToName(dottedToName(name)),
        enabled: true,
        value: undefined,
      };
    });
    fetchedItems.map(i => {
      i.enable = function (this: GoogleFitDevice, status: boolean) {
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
