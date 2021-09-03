export type DataAvailableCallback = (
  itemId: string,
  value: any,
  itemName?: string,
) => void;
export interface IHealthManager {
  startScan(onDeviceFound: (device: IHealthDevice) => void): void;
  stopScan(): void;
  connect(deviceId: string): Promise<IHealthDevice>;
}

export type DeviceType = 'real' | 'simulated' | 'platform';
export interface IHealthDevice {
  name: string;
  id: string;
  paired: boolean;
  connected: boolean;
  type: DeviceType;
  fetch(): Promise<void>;
  disconnect(): Promise<void>;
  items?: IHealthItem[];
  addListener(
    eventType: string,
    listener: (...args: any[]) => any,
    context?: any,
  ): void;
  removeListener(eventType: string, listener: (...args: any[]) => any): void;
}

export interface IHealthItem {
  id: string;
  name?: string;
  parentId?: string;
  value: any | undefined;
  enabled: boolean;
  enable(status: boolean): Promise<boolean>;
  getData?(): any;
}

export type ItemData = {
  itemId: string;
  itemName?: string;
  value: any;
};

export type MonitoredDevice = IHealthDevice & {
  monitorIds: {
    [itemId: string]: number; // the value is the id for the setInterval loop. Used to clear it
  };
};

const bluetoothHealthServices = [
  '180d',
  '1810',
  '181f',
  '1808',
  '1809',
  '180d',
  '183a',
  '181d',
];

export function isHealthService(serviceUUID: string) {
  if (
    bluetoothHealthServices.indexOf(serviceUUID.substring(4, 8).toLowerCase()) >
    -1
  ) {
    return true;
  }
  return false;
}
