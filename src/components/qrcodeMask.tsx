import React from 'react';
import { View } from 'react-native';
export default function QRCodeMask() {
    return (<View style={{ position: 'relative', width: 250, height: 250 }}>
        <View style={{
            position: 'absolute',
            top: 0,
            left: 0,
            height: 50,
            width: 50,
            borderColor: 'black',
            borderLeftWidth: 5,
            borderTopWidth: 5,
        }}></View>
        <View style={{
            position: 'absolute',
            top: 0,
            left: 200,
            height: 50,
            width: 50,
            borderColor: 'black',
            borderRightWidth: 5,
            borderTopWidth: 5,
        }}></View>
        <View style={{
            position: 'absolute',
            top: 200,
            left: 0,
            height: 50,
            width: 50,
            borderColor: 'black',
            borderLeftWidth: 5,
            borderBottomWidth: 5,
        }}></View>
        <View style={{
            position: 'absolute',
            top: 200,
            left: 200,
            height: 50,
            width: 50,
            borderColor: 'black',
            borderRightWidth: 5,
            borderBottomWidth: 5,
        }}></View>
    </View>)
}