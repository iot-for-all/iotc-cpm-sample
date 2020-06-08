import React from 'react';
import { View, processColor } from 'react-native';
import { ActivityIndicator, Text } from 'react-native-paper';
import { Detail } from './typography';
import DefaultStyles from '../styles';
import GetConnected from '../assets/home_connected_icon.svg'

export function Loading() {
    return (<View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size='large' />
    </View>)
}

export function GetConnectedHeader() {
    const header = 'Get connected';
    const sub = 'Pair a device or sync your data';
    return (
        <View style={{ flexDirection: 'row', padding: 10, alignItems: 'center' }}>
            <GetConnected style={{ marginHorizontal: 16, marginVertical: 10 }} />
            <View style={{ flexDirection: 'column' }}>
                <Text style={DefaultStyles.header}>{header}</Text>
                <Detail>{sub}</Detail>
            </View>
        </View>)
}

export function getRandomColor() {
    return processColor(`rgb(${(Math.floor(Math.random() * 256))},${(Math.floor(Math.random() * 256))},${(Math.floor(Math.random() * 256))})`);
}