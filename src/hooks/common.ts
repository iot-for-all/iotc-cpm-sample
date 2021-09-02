import {useRef, useEffect, useState} from 'react';
import {useIsFocused, useNavigation} from '@react-navigation/native';
import {NavigationProperty} from 'types';

export type EnvironmentVariables = {
  GoogleFit?: boolean;
  AppleHealth?: boolean;
} & {[x: string]: any};

export function usePrevious<T>(value: T) {
  // The ref object is a generic container whose current property is mutable ...
  // ... and can hold any value, similar to an instance property on a class
  const ref = useRef<T>();

  // Store current value in ref
  useEffect(() => {
    ref.current = value;
  }, [value]); // Only re-run if value changes

  // Return previous value (happens before update in useEffect above)
  return ref.current;
}

export function useEnv() {
  const [variables, setVariables] = useState<EnvironmentVariables>({
    GoogleFit: true,
    AppleHealth: true,
  });

  const readEnv = async function () {
    try {
      const envvars = (await import('../../env.json')).default;
      console.log(`Envvars: ${JSON.stringify(envvars)}`);
      setVariables(vars => ({...vars, ...envvars}));
    } catch (e) {
      setVariables(vars => ({
        ...vars,
        ...{
          GoogleFit: true,
          AppleHealth: true,
        },
      }));
    }
  };
  useEffect(() => {
    readEnv();
  }, []);

  return variables;
}

/**
 * Get a timer returning 'true' when triggers.
 * @param seconds Number of seconds before timer triggers.
 */
export function useTimer(seconds: number) {
  const [done, setDone] = useState(false);
  useEffect(() => {
    setTimeout(() => {
      setDone(true);
    }, seconds);
  }, [seconds]);
  return done;
}

export function useHeaderTitle(title: string): void {
  const isFocused = useIsFocused();
  const navigation = useNavigation<NavigationProperty>();
  const counter = useRef(0);

  useEffect(() => {
    if (isFocused) {
      counter.current++;
      navigation.setParams({title});
    }
  }, [navigation, title, isFocused]);
}
