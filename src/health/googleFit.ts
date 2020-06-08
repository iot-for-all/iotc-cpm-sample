import { IHealthhManager, IHealthDevice, IHealthItem, DataAvailableCallback } from "../models";
import GoogleFit, { Scopes } from 'react-native-google-fit';
import { camelToName, dottedToName, snakeToName } from "../utils";
import { PermissionsAndroid } from "react-native";
import { GoogleFitStepResult } from '../types';

const SCOPES = [Scopes.FITNESS_ACTIVITY_READ, Scopes.FITNESS_BODY_READ, Scopes.FITNESS_BODY_TEMPERATURE_READ, Scopes.FITNESS_BLOOD_PRESSURE_READ];
enum GOOGLE_ITEMS {
    STEPS = 'Steps'
}
const GOOGLE_PREFIX = 'https://www.googleapis.com/auth/fitness.';

export class GoogleFitManager implements IHealthhManager {

    private device: IHealthDevice | null;
    constructor() {
        this.device = null;
    }

    startScan(onDeviceFound: (device: IHealthDevice) => void): void {
        (async () => {
            await GoogleFit.checkIsAuthorized();
            const granted = await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
                {
                    title: 'Location Permission',
                    message: `Application would like to use location permissions for distance calculation`,
                    buttonNeutral: 'Ask Me Later',
                    buttonNegative: 'Cancel',
                    buttonPositive: 'OK',
                }
            );
            if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
                throw new Error('Bluetooth permissions not granted');
            }
            if (!GoogleFit.isAuthorized) {
                const authResult = await GoogleFit.authorize({ scopes: SCOPES });
                if (authResult.success) {
                    GoogleFit.startRecording((data) => {
                        if (data.recording) {
                            this.device = new GoogleFitDevice('googleFit', 'Google Fit');
                            onDeviceFound(this.device);
                        }
                    });
                }
                else {
                    throw new Error(`Google Fit Authorization denied: ${authResult.message}`);
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
        GoogleFit.observeSteps((data) => {
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

    private async enableItem(item: IHealthItem, status: boolean, onDataAvailable?: DataAvailableCallback): Promise<boolean> {
        if (status && onDataAvailable) {
            if (this.enabled[item.id]) {
                return true;
            }

            // @ts-ignore
            // sometimes setInterval gets typings from node instead of react-native
            this.enabled[item.id] = setInterval(async () => {
                if (item.value) {
                    onDataAvailable(item.id, item.value, item.name);
                }
                else {
                    // get current value for the item

                    let startDate = new Date();
                    startDate.setDate(startDate.getDate() - 1);
                    switch (item.id) {
                        case GOOGLE_ITEMS.STEPS:
                            const results = await GoogleFit.getDailyStepCountSamples({ startDate: startDate.toISOString(), endDate: new Date().toISOString() }) as GoogleFitStepResult[];
                            results.forEach(result => {
                                if (result.steps && result.steps.length > 0) {
                                    item.value = result.steps[result.steps.length - 1].value;
                                }
                            });
                            onDataAvailable(item.id, item.value, item.name);
                            break;
                        default:
                            break;
                    }
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
        let fetchedItems: any[] = Object.keys(GOOGLE_ITEMS).map(perm => {
            // const name = perm.replace(GOOGLE_PREFIX, '').replace('read', '');
            const name = (<any>GOOGLE_ITEMS)[perm];
            return {
                id: name,
                name: snakeToName(dottedToName(name)),
                enabled: false,
                value: undefined
            }
        });
        fetchedItems.map(i => {
            i.enable = function (this: GoogleFitDevice, status: boolean, onDataAvailable?: DataAvailableCallback) {
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