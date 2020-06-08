import React, { useContext, useEffect } from 'react';
import { ConfigContext } from '../contexts/config';
import { Loading } from '../components/utils';
import { Platform, View } from 'react-native';
import { AppleHealthManager } from '../health/appleHealth';
import { IHealthhManager, IHealthDevice } from '../models';
import { GoogleFitManager } from '../health/googleFit';
import { Headline } from '../components/typography';
import { useNavigation } from '@react-navigation/native';
import { NavigationProperty, CONSTANTS } from '../types';


const Manager = Platform.select<typeof AppleHealthManager | typeof GoogleFitManager>({
    android: GoogleFitManager,
    ios: AppleHealthManager
}) as (typeof AppleHealthManager | typeof GoogleFitManager);

export default function Providers() {
    const { state, dispatch } = useContext(ConfigContext);
    const navigation = useNavigation<NavigationProperty>();

    useEffect(() => {
        const initManager = async () => {
            if (state.healthManager) {
                state.healthManager.startScan(async (device) => {
                    const dev = await (state.healthManager as IHealthhManager).connect('');
                    navigation.navigate(CONSTANTS.Screens.INSIGHT_SCREEN);
                    await dev.fetch();
                    dispatch({
                        type: 'REGISTER',
                        payload: dev
                    });
                });
            }
            else {
                const payload = new Manager();
                dispatch({
                    type: 'ACTIVATE',
                    payload
                });
            }
        }
        initManager();
    }, [state.healthManager]);

    if (!state.healthManager) {
        return (
            <View style={{ flex: 1 }}>
                <Loading />
                <Headline style={{ flex: 1, textAlign: 'center', justifyContent: 'center' }}>Loading provider data ...</Headline>
            </View>)
    }

    return (null);
}