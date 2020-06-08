import React, { useContext } from 'react';
import { Appbar } from 'react-native-paper';
import { Platform } from 'react-native';
import { Route } from '@react-navigation/routers';
import { Scene } from '@react-navigation/stack/lib/typescript/src/types';
import { NavigationProperty, RouteParams } from '../types';
import { ConfigContext } from '../contexts/config';

export interface IAppBarProps {
    scene?: Scene<RouteParams<string>>,
    previous?: Scene<RouteParams<string>>,
    navigation: NavigationProperty
}

export default function ApplicationBar(props: IAppBarProps) {
    const { scene, previous, navigation } = props;
    const { state: configState, dispatch: configDispatch } = useContext(ConfigContext);
    let leftIcon = 'menu';
    let leftAction = configState.headersActions?.left;
    let rightAction = configState.headersActions?.right;
    let title = scene?.route.name;

    if (previous) {
        leftIcon = 'arrow-left';
        leftAction = function () {
            navigation.pop();
        };
    }
    if (scene && scene.route.params) {
        title = scene.route.params.title;
    }

    const rightIcon = Platform.select({
        android: 'dots-vertical',
        ios: 'dots-horizontal'
    }) as string;


    return (<Appbar.Header>
        <Appbar.Action icon={leftIcon} onPress={leftAction} />
        <Appbar.Content title={title} />
        <Appbar.Action icon={rightIcon} onPress={rightAction} />
    </Appbar.Header>)
}