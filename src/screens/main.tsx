import React, { useContext, useEffect, useState, memo } from "react";
import { ConfigContext } from "../contexts/config";
import { View, StyleSheet, Platform } from "react-native";
import { Text, IconButton } from "react-native-paper";
import { Footer } from "../components/footer";
import DefaultStyles from "../styles";
import ApplicationBar from "../components/appbar";
import { Detail, CPMText } from "../components/typography";
import { useUser } from "../hooks/auth";
import { createStackNavigator, TransitionPresets } from '@react-navigation/stack';
import ConnectedLogo from '../assets/home_connected_logo.svg';
import Devices from './devices';
import Insight from './insight';
import { TouchableOpacity } from "react-native-gesture-handler";
import { useNavigation, DrawerActions, Route } from "@react-navigation/native";
import { CONSTANTS, NavigationScreens, NavigationParams, RouteParams } from "../types";
import { createDrawerNavigator } from '@react-navigation/drawer';
import InsightDrawer from '../components/insightDrawer';
import Providers from "./providers";
import { GetConnectedHeader } from "../components/utils";
import { useEnv, useHeaderTitle } from "../hooks/common";
import { Scene } from "@react-navigation/stack/lib/typescript/src/types";
import { normalize } from "../utils";


const instructions = 'Start seeing insights by pairing a bluetooth device or syncing data from your health app.'


const sync = Platform.select({
    android: 'SYNC GOOGLE FIT',
    ios: 'SYNC APPLE HEALTH'
});

const headerMode = Platform.select<'screen' | 'float'>({
    android: 'screen',
    ios: 'float'
});

const Stack = createStackNavigator<NavigationScreens>();
const Drawer = createDrawerNavigator();
const getTitle = function (scene: Scene<RouteParams<string>>) {
    if (scene.route.params) {
        const routeTitle = (scene.route.params as NavigationParams).title!;
        if (routeTitle) {
            return routeTitle;
        }
    }
    return scene.route.name;
}

function Navigation() {
    return (
        <Stack.Navigator initialRouteName={CONSTANTS.Screens.HOME_SCREEN} headerMode={headerMode}
            screenOptions={{
                header: function ({ scene, previous, navigation }) {
                    return (
                        <ApplicationBar goBack={navigation.pop} hasPrevious={previous != undefined} title={getTitle(scene)} />
                    )
                },
                transitionSpec: {
                    open: TransitionPresets.DefaultTransition.transitionSpec.open,
                    close: {
                        ...TransitionPresets.DefaultTransition.transitionSpec.close,
                        config: {
                            duration: 0
                        },
                        animation: 'timing'
                    }
                }
            }} >
            <Stack.Screen name={CONSTANTS.Screens.HOME_SCREEN}
                component={Home} />
            <Stack.Screen name={CONSTANTS.Screens.DEVICES_SCREEN}
                component={Devices}
            />
            <Stack.Screen name={CONSTANTS.Screens.PROVIDERS_SCREEN}
                component={Providers}
            />
            <Stack.Screen name={CONSTANTS.Screens.INSIGHT_SCREEN}
                component={Insight}
            />
        </Stack.Navigator >
    )
}

export default function Main() {
    const { state, dispatch } = useContext(ConfigContext);
    const [user] = useUser();

    if (!user || state.centralClient === undefined) {
        return (null);
    }

    return (<React.Fragment>
        <Drawer.Navigator drawerContent={({ state: navigationState, navigation }) => {
            let currentScreen = '';
            const stackState = navigationState.routes[0].state;
            if (stackState && stackState.index) {
                currentScreen = stackState.routes[stackState.index].name;
            }
            return (<InsightDrawer sourceSide='left' close={() => {
                navigation.dispatch(DrawerActions.closeDrawer());
            }} currentScreen={currentScreen} />)
        }}
            edgeWidth={-100}
        >
            <Drawer.Screen name='Main' component={Navigation} />
        </Drawer.Navigator>
    </React.Fragment>);
}

function Home() {
    const navigation = useNavigation();
    useHeaderTitle('Home');

    return (<View style={{ flex: 1 }}>
        <View style={{ flex: 3 }}>
            <View style={{ ...DefaultStyles.elevated, ...style.box }}>
                <GetConnectedHeader />
                <ConnectedLogo width='100%' height={250} style={{ justifyContent: 'center' }} />
                <CPMText style={{ paddingHorizontal: 20, paddingVertical: normalize(10) }}>{instructions}</CPMText>
                <Options />
            </View>
        </View>
        <Footer text='If you choose to pair a BLE device, you can use a real device or a simulated device. You can also choose to access your phone’s health data' />
    </View>);
}


function Options() {
    const navigation = useNavigation();
    const envs = useEnv();

    return (<View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, marginTop: 10 }}>
        <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center' }} onPress={() => {
            navigation.navigate(CONSTANTS.Screens.DEVICES_SCREEN);
            // Custom title can be set in this way. However, this will not be reverted when going back
            navigation.setParams({ title: 'Devices' });
        }}>
            <IconButton icon='bluetooth' size={30} style={{ marginRight: -5 }} />
            <CPMText>PAIR DEVICE</CPMText>
        </TouchableOpacity>
        {
            (Platform.OS === 'android' && envs['GoogleFit'])
                || (Platform.OS === 'ios' && envs['AppleHealth']) ?
                <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center' }} onPress={() => {

                    navigation.navigate(CONSTANTS.Screens.PROVIDERS_SCREEN);
                }}>
                    <IconButton icon='sync' size={30} style={{ marginRight: -5 }} />
                    <CPMText>{sync}</CPMText>
                </TouchableOpacity> : <></>}
    </View>)
}

const style = StyleSheet.create({
    box: {
        backgroundColor: 'white',
        marginTop: 20,
        marginHorizontal: 10
    }
})