import React, { useReducer } from "react";
import { IIoTCClient } from "react-native-azure-iotcentral-client";
import { IHealthhManager, IHealthDevice } from "../models";
import { ChartUpdateCallback } from "../types";

interface HeadersActions {
    left?(): void,
    right?(): void
}

export interface IConfigState {
    device: IHealthDevice | null,
    centralClient: IIoTCClient | null | undefined,
    healthManager: IHealthhManager | null,
    headersActions: HeadersActions | null,
    insightUpdate: ChartUpdateCallback | null
}

type IIoTCAction = {
    type: 'CONNECT' | 'DISCONNECT',
    payload: IIoTCClient | null
}
type IHealthAction = {
    type: 'ACTIVATE' | 'UNACTIVATE',
    payload: IHealthhManager | null
}

type IDeviceAction = {
    type: 'REGISTER' | 'UNREGISTER',
    payload: IHealthDevice | null
}

type IHeaderAction = {
    type: 'SET',
    payload: HeadersActions
}

type IInsightAction = {
    type: 'UPDATE',
    payload: ChartUpdateCallback | null
}

type IConfigAction = IDeviceAction | IHeaderAction | IHealthAction | IInsightAction | IIoTCAction;

export type IConfigContext = {
    state: IConfigState,
    dispatch: React.Dispatch<IConfigAction>
}

export const configReducer = (state: IConfigState, action: IConfigAction) => {
    switch (action.type) {
        case 'CONNECT':
        case 'DISCONNECT':
            return { ...state, centralClient: action.payload }
        case 'REGISTER':
        case 'UNREGISTER':
            return { ...state, device: action.payload };
        case 'SET':
            return { ...state, headersActions: { ...state.headersActions, ...action.payload } };
        case 'ACTIVATE':
        case 'UNACTIVATE':
            return { ...state, healthManager: action.payload };
        case 'UPDATE':
            return { ...state, insightUpdate: action.payload };
        default:
            return state;
    }
}


const initialState: IConfigState = {
    device: null,
    centralClient: undefined,
    headersActions: null,
    healthManager: null,
    insightUpdate: null
}



export const ConfigContext = React.createContext<IConfigContext>({
    state: initialState,
    dispatch: () => { }
});
const { Provider } = ConfigContext;

const ConfigProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [state, dispatch] = useReducer(configReducer, initialState);
    return (
        <Provider value={{ state, dispatch }}>
            {children}
        </Provider>
    )
};

export default ConfigProvider;