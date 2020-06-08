import React from 'react';
import { View, StyleSheet, ViewStyle } from "react-native";
import { Text, IconButton } from 'react-native-paper';
import { useState } from "react";

const defaultTitle = 'Learn more about this technology';
export interface IFooterProps {
    text: string,
    title?: string
    style?: ViewStyle
    textColor?: string
}
export function Footer(props: IFooterProps) {
    const [expanded, setExpanded] = useState(false);
    return (<View style={{ ...style.container, ...props.style }}>
        <IconButton icon={expanded ? 'chevron-down' : 'chevron-up'} onPress={() => {
            setExpanded(current => (!current));
        }} size={20} color={props.textColor} />
        {expanded ? <Text style={{ textAlign: 'center', ...(props.textColor ? { color: props.textColor } : {}) }}>{props.text}</Text> : <Text style={(props.textColor ? { color: props.textColor } : {})}>{props.title ? props.title : defaultTitle}</Text>}
    </View>)
}

const style = StyleSheet.create({
    container: {
        justifyContent: 'flex-end',
        alignItems: 'center',
        marginBottom: 60,
        marginHorizontal: 30
    }
});