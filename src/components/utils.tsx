import React, { useState } from 'react';
import { View, processColor } from 'react-native';
import { ActivityIndicator, Text, Portal, Dialog, Button } from 'react-native-paper';
import { Detail } from './typography';
import DefaultStyles from '../styles';
import GetConnected from '../assets/home_connected_icon.svg';
import { ReactDispatch } from '../types';

export function Loading() {
    return (<View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size='large' />
    </View>)
}

export function ErrorDialog(props: { visible: boolean, setVisible: ReactDispatch<boolean>, title: string, text: string }) {
    const { visible, setVisible, text, title } = props;
    return (<Portal>
        <Dialog
            visible={visible}
            onDismiss={() => setVisible(false)}>
            <Dialog.Title>{title}</Dialog.Title>
            <Dialog.Content>
                <Detail>{text}</Detail>
            </Dialog.Content>
            <Dialog.Actions>
                <Button onPress={() => setVisible(false)}>OK</Button>
            </Dialog.Actions>
        </Dialog>
    </Portal>)
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