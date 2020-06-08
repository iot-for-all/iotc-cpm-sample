import { useEffect, useState, useContext } from "react";
import { ConfigContext } from "../contexts/config";
import { SimulatedHealthManager } from "../health/simulated";

export function useBluetoothData(deviceId: string) {
    const [data, setData] = useState([]);

    useEffect(() => {
        const onDataAvailable = () => {
            setData(currentData => [...currentData, ...[]]);
        }

    }, []);
    return data;
}


export function isSimulated(): boolean {
    const { state } = useContext(ConfigContext);
    const [simulated, setSimulated] = useState(state.healthManager instanceof SimulatedHealthManager);
    
    useEffect(() => {
        setSimulated(state.healthManager instanceof SimulatedHealthManager);
    }, [state.healthManager]);

    return simulated;
}