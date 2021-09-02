import React, {useReducer} from 'react';
import {IIoTCClient} from 'react-native-azure-iotcentral-client';
import {IHealthManager, IHealthDevice} from '../models';
import {ChartUpdateCallback} from '../types';

export interface IConfigState {
  device: IHealthDevice | null;
  centralClient: IIoTCClient | null | undefined;
  healthManager: IHealthManager | null;
  insightUpdate: ChartUpdateCallback | null;
}

type IIoTCAction = {
  type: 'CONNECT' | 'DISCONNECT';
  payload: IIoTCClient | null;
};
type IHealthAction = {
  type: 'ACTIVATE' | 'UNACTIVATE';
  payload: IHealthManager | null;
};

type IDeviceAction = {
  type: 'HEALTH_CONNECT' | 'HEALTH_DISCONNECT';
  payload: IHealthDevice | null;
};

type IConfigAction = IDeviceAction | IHealthAction | IIoTCAction;

export type IConfigContext = {
  state: IConfigState;
  dispatch: React.Dispatch<IConfigAction>;
};

export const configReducer = (state: IConfigState, action: IConfigAction) => {
  switch (action.type) {
    case 'CONNECT':
    case 'DISCONNECT':
      return {...state, centralClient: action.payload};
    case 'HEALTH_CONNECT':
    case 'HEALTH_DISCONNECT':
      return {...state, device: action.payload};
    case 'ACTIVATE':
    case 'UNACTIVATE':
      return {...state, healthManager: action.payload};
    default:
      return state;
  }
};

const initialState: IConfigState = {
  device: null,
  centralClient: undefined,
  healthManager: null,
  insightUpdate: null,
};

export const ConfigContext = React.createContext<IConfigContext>({
  state: initialState,
  dispatch: () => {},
});
const {Provider} = ConfigContext;

const ConfigProvider: React.FC<{children: React.ReactNode}> = ({children}) => {
  const [state, dispatch] = useReducer(configReducer, initialState);
  return <Provider value={{state, dispatch}}>{children}</Provider>;
};

export default ConfigProvider;
