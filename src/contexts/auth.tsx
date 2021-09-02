import React, {useReducer} from 'react';

export interface IUser {
  id: string;
}

export interface IAuthState {
  user: IUser | null;
  initialized: boolean;
}

export interface IAuthAction {
  type: 'LOGIN' | 'LOGOUT';
  payload: IAuthState;
}

export type IAuthContext = {
  state: IAuthState;
  dispatch: React.Dispatch<IAuthAction>;
};

export const authReducer = (state: IAuthState, action: IAuthAction) => {
  switch (action.type) {
    case 'LOGIN':
    case 'LOGOUT':
      return {...state, ...action.payload};
    default:
      return state;
  }
};

const initialState: IAuthState = {
  user: null,
  initialized: false,
};

export const AuthContext = React.createContext<IAuthContext>({
  state: initialState,
  dispatch: () => {},
});
const {Provider} = AuthContext;

const AuthProvider: React.FC<{children: React.ReactNode}> = ({children}) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  return <Provider value={{state, dispatch}}>{children}</Provider>;
};

export default AuthProvider;
