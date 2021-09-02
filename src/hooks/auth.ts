import {IUser, AuthContext} from '../contexts/auth';
import {useContext} from 'react';

type UserDispatch = (value: IUser | null) => Promise<void>;

export function useUser(): [IUser | null, UserDispatch] {
  const {state, dispatch} = useContext(AuthContext);

  const setUser: UserDispatch = async function (value: IUser | null) {
    if (value == null) {
      dispatch({
        type: 'LOGOUT',
        payload: {user: null, initialized: true},
      });
    } else {
      dispatch({
        type: 'LOGIN',
        payload: {user: value, initialized: true},
      });
    }
  };

  return [state.user, setUser];
}
