import React, { useContext, useEffect, useRef } from 'react';
import { SafeAreaView, View, StyleSheet, Image } from 'react-native';
import { Name, Headline, Detail, Item } from './typography';
import { Switch, IconButton, Divider } from 'react-native-paper';
import { ChartUpdateCallback, NavigationProperty, CONSTANTS } from '../types';
import { ConfigContext } from '../contexts/config';
import { ScrollView } from 'react-native-gesture-handler';
import { AppleHealthManager } from '../health/appleHealth';
import { GoogleFitManager } from '../health/googleFit';
interface DrawerProps {
    sourceSide: 'left' | 'right',
    currentScreen: string,
    close(): void
}

/**
 * This navigator doesn't actually navigate to any screen.
 * It is used to have a drawer for chart management by levereging on what react-navigation already offers (gestures, styles...).
 * @param props 
 */
export default function InsightDrawer(props: DrawerProps) {
    const { state, dispatch } = useContext(ConfigContext);
    const { sourceSide, currentScreen } = props;
    const alignSelf = sourceSide === 'left' ? 'flex-start' : 'flex-end';
    let icon: any = 'bluetooth';


    if (state.healthManager) {
        if (state.healthManager instanceof AppleHealthManager) {
            icon = ({ size }: { size: number }) => (
                <Image
                    source={require('../assets/health_kit.png')}
                    style={{ width: 60, height: 60 }}
                />
            );
        }
        else if (state.healthManager instanceof GoogleFitManager) {
            icon = ({ size }: { size: number }) => (
                <Image
                    source={require('../assets/google_fit.png')}
                    style={{ width: size, height: size - 5 }}
                />
            );
        }
    }

    if (!state.device || !state.device.items || currentScreen !== CONSTANTS.Screens.INSIGHT_SCREEN) {
        return (null);
    }
    return (
        <SafeAreaView style={style.container}>
            <View style={style.header}>
                <IconButton icon={icon} size={30} style={{ marginLeft: -5, marginRight: 20 }} />
                <View style={{ width: '60%', paddingBottom: 100 }}>
                    <View style={{ flexDirection: 'row' }}>
                        <Headline>Sync options</Headline>
                        <IconButton onPress={() => {
                            props.close()
                        }} icon='chevron-left' style={{ marginLeft: 40, marginTop: -5 }} />
                    </View>
                    <Detail>Which kind of device data would you like to show?</Detail>
                </View>
            </View>
            <Name style={{ marginBottom: 20 }}>{state.device.name}</Name>
            <Divider />
            <ScrollView>
                {state.device.items.map((item, index) => (
                    <View style={style.itemContainer} key={`view-${item.id}`}>
                        <Item style={{ width: 150 }}>{item.name}</Item>
                        {/* pass extra parameter to the ref in order to process and enable only valid ids */}
                        <Switch {...{ refId: `${item.parentId}/${item.id}` }} value={item.enabled} onValueChange={async (current) => {
                            await item.enable(current);
                            // dispatch is needed to update state of device items
                            dispatch({
                                type: 'HEALTH_CONNECT',
                                payload: state.device
                            });
                        }} />
                    </View>
                ))}
            </ScrollView>
        </SafeAreaView>)
}

const style = StyleSheet.create({
    container: {
        flex: 1,
        marginLeft: 20
    },
    header: {
        marginTop: 30,
        flexDirection: 'row'
    },
    itemContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 20
    }
});