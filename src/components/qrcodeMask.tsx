import React from 'react';
import { View } from 'react-native';
import { useScreenDimensions } from '../hooks/layout';
export default function QRCodeMask() {
    const { screen } = useScreenDimensions();

    const markerWidth = Math.floor(screen.width / 2);
    const sectorWidth = Math.floor(markerWidth / 5);
    console.log(`Marker ${markerWidth}`);
    console.log(`Sector ${sectorWidth}`);
    return (<View style={{ position: 'relative', width: markerWidth + sectorWidth, height: markerWidth + sectorWidth }}>
        <View style={{
            position: 'absolute',
            top: 0,
            left: 0,
            height: sectorWidth,
            width: sectorWidth,
            borderColor: 'black',
            borderLeftWidth: 5,
            borderTopWidth: 5,
        }}></View>
        <View style={{
            position: 'absolute',
            top: 0,
            left: markerWidth,
            height: sectorWidth,
            width: sectorWidth,
            borderColor: 'black',
            borderRightWidth: 5,
            borderTopWidth: 5,
        }}></View>
        <View style={{
            position: 'absolute',
            top: markerWidth,
            left: 0,
            height: sectorWidth,
            width: sectorWidth,
            borderColor: 'black',
            borderLeftWidth: 5,
            borderBottomWidth: 5,
        }}></View>
        <View style={{
            position: 'absolute',
            top: markerWidth,
            left: markerWidth,
            height: sectorWidth,
            width: sectorWidth,
            borderColor: 'black',
            borderRightWidth: 5,
            borderBottomWidth: 5,
        }}></View>
    </View>)
}