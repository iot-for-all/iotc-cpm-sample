import React from 'react';
import { Button, useTheme } from "react-native-paper";
import { StyleProp, ViewStyle } from "react-native";
import DefaultStyles from '../styles';

export type CPMButtonProps = {
    children: React.ReactNode,
    onPress?: () => void,
    mode?: 'text' | 'outlined' | 'contained',
    style?: StyleProp<ViewStyle>
}

export function CPMButton(props: CPMButtonProps) {
    const { mode, children, style, onPress } = props;
    const theme = useTheme();
    const textColor = theme.colors.text;

    return (
        <Button onPress={onPress} mode={mode}
            color='#75FBFD'
            style={[style, { justifyContent: 'center' }, (mode === 'outlined' ? { borderColor: '#75FBFD', borderWidth: 2, ...DefaultStyles.elevated } : {})]}
            labelStyle={{ color: textColor }}>
            {children}
        </Button>)
}