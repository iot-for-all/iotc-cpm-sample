import {useEffect, useState, useContext} from 'react';
import {ConfigContext} from '../contexts/config';
import {SimulatedHealthManager} from '../health/simulated';

export function useSimulated(): boolean {
  const {state} = useContext(ConfigContext);
  const [simulated, setSimulated] = useState(
    state.healthManager instanceof SimulatedHealthManager,
  );

  useEffect(() => {
    setSimulated(state.healthManager instanceof SimulatedHealthManager);
  }, [state.healthManager]);

  return simulated;
}
