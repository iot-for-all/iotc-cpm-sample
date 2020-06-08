import { IHealthhManager, IHealthDevice, IHealthItem, DataAvailableCallback } from "../models";
import HealthKit, { HealthKitPermissions, RealTimeData } from 'rn-apple-healthkit';
import { NativeAppEventEmitter, EmitterSubscription, TouchableOpacityBase } from "react-native";
import { camelToName } from "../utils";
import { HealthRealTimeData } from "../types";


const PERMS = HealthKit.Constants.Permissions;
const OBSERVABLES = [PERMS.StepCount, PERMS.HeartRate, PERMS.DistanceWalkingRunning, PERMS.DistanceCycling, PERMS.BodyTemperature, PERMS.BloodPressureDiastolic, PERMS.BloodPressureSystolic];
const OPTIONS: HealthKitPermissions = {
    permissions: {
        read: OBSERVABLES,
        write: []
    }
}

async function requestPermissions(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
        HealthKit.isAvailable((err, result) => {
            if (err) {
                return reject(err);
            }
            return resolve();
        })
    });
}

export class AppleHealthManager implements IHealthhManager {

    private device: IHealthDevice | null;
    constructor() {
        this.device = null;
    }
    startScan(onDeviceFound: (device: IHealthDevice) => void): void {
        // Use start scan to init
        requestPermissions().then(() => {
            HealthKit.initHealthKit(OPTIONS, (err, results) => {
                if (err) {
                    throw (err);
                }
                HealthKit.initStepCountObserver({}, () => { });

                HealthKit.setObserver({ type: HealthRealTimeData.Walking });
                HealthKit.setObserver({ type: HealthRealTimeData.Running });
                HealthKit.setObserver({ type: HealthRealTimeData.Cycling });
                this.device = new AppleHealthDevice('healthKit', 'Apple Health Kit')
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
        NativeAppEventEmitter.addListener('change:steps', async (data) => {
            const value = await new Promise(r => HealthKit.getStepCount({}, (err, result) => r(result.value)));
            if (this.items) {
                let item = this.items.find(i => i.id === PERMS.StepCount);
                if (item) {
                    item.value = value;
                }
            }
        })
        NativeAppEventEmitter.addListener('observer', (data) => {
            console.log(`Observer: ${data}`);
        })
    }

    private async enableItem(item: IHealthItem, status: boolean, onDataAvailable?: DataAvailableCallback): Promise<boolean> {
        if (status && onDataAvailable) {
            if (this.enabled[item.id]) {
                return true;
            }

            // get current value for the item

            let startDate = new Date();
            startDate.setDate(startDate.getDate() - 1);
            switch (item.id) {
                case PERMS.Steps:
                case PERMS.StepCount:
                    item.value = await new Promise(r => HealthKit.getStepCount({}, (err, result) => r(result.value)));
                    break;
                case PERMS.HeartRate:
                    item.value = await new Promise(r => HealthKit.getHeartRateSamples({ startDate: startDate.toISOString() }, (err, result) => {
                        if (result.length > 0) {
                            r(result[result.length - 1].value);
                        }
                        else r(undefined);
                    }));
                    break;
                case PERMS.BodyTemperature:
                    item.value = await new Promise(r => HealthKit.getBodyTemperatureSamples({ startDate: startDate.toISOString() }, (err, result) => {
                        if (result.length > 0) {
                            r(result[result.length - 1].value);
                        }
                        else r(undefined);
                    }));
                    break;
                case PERMS.BloodPressureDiastolic:
                    item.value = await new Promise(r => HealthKit.getBloodPressureSamples({ startDate: startDate.toISOString() }, (err, result) => {
                        if (result.length > 0) {
                            r(result[result.length - 1].bloodPressureDiastolicValue);
                        }
                        else r(undefined);
                    }));
                    break;
                case PERMS.BloodPressureSystolic:
                    item.value = await new Promise(r => HealthKit.getBloodPressureSamples({ startDate: startDate.toISOString() }, (err, result) => {
                        if (result.length > 0) {
                            r(result[result.length - 1].bloodPressureSystolicValue);
                        }
                        else r(undefined);
                    }));
                    break;
                default:
                    item.value = 0;
            }

            // @ts-ignore
            // sometimes setInterval gets typings from node instead of react-native
            this.enabled[item.id] = setInterval(() => {
                if (item.value) {
                    onDataAvailable(item.id, item.value, item.name);
                }
            }, 5000);
            item.enabled = true;
            return true;
        }
        else {
            if (this.enabled[item.id]) {
                delete this.enabled[item.id];
            }
            item.enabled = false;
            return false;
        }
    }

    public async fetch() {
        let fetchedItems: any[] = Object.keys(HealthRealTimeData).concat(OBSERVABLES).map(perm => ({
            id: perm,
            name: camelToName(perm),
            enabled: false,
            value: undefined
        }));
        fetchedItems.map(i => {
            i.enable = function (this: AppleHealthDevice, status: boolean, onDataAvailable?: DataAvailableCallback) {
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