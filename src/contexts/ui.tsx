import React, { useReducer } from "react";

interface HeadersActions {
    left?(): void,
    right?(): void
}

export interface IUIState {
    headersActions: HeadersActions | null
}


type IHeaderAction = {
    type: 'SET',
    payload: HeadersActions
}


type IUIAction = IHeaderAction;

export type IUIContext = {
    state: IUIState,
    dispatch: React.Dispatch<IUIAction>
}

export const uiReducer = (state: IUIState, action: IUIAction) => {
    switch (action.type) {
        case 'SET':
            return { ...state, headersActions: { ...state.headersActions, ...action.payload } };
        default:
            return state;
    }
}


const initialState: IUIState = {
    headersActions: null
}



export const UIContext = React.createContext<IUIContext>({
    state: initialState,
    dispatch: () => { }
});
const { Provider } = UIContext;

const UIProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [state, dispatch] = useReducer(uiReducer, initialState);
    return (
        <Provider value={{ state, dispatch }}>
            {children}
        </Provider>
    )
};

export default UIProvider;