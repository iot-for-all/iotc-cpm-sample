import React from 'react';
import { View, StyleSheet, ViewStyle, Platform } from 'react-native';
import { IconButton } from 'react-native-paper';
import { useState } from 'react';
import { CPMText } from './typography';

const defaultTitle = 'Learn more about this technology';
export interface IFooterProps {
  text: string;
  title?: string;
  style?: ViewStyle;
  textColor?: string;
}
export function Footer(props: IFooterProps) {
  const [expanded, setExpanded] = useState(false);
  return (
    <View style={{ ...style.container, ...props.style }}>
      <IconButton
        icon={expanded ? 'chevron-down' : 'chevron-up'}
        onPress={() => {
          setExpanded(current => !current);
        }}
        size={20}
        color={props.textColor}
      />
      {expanded ? (
        <CPMText
          style={{
            textAlign: 'center',
            ...(props.textColor ? { color: props.textColor } : {}),
          }}>
          {props.text}
        </CPMText>
      ) : (
        <CPMText style={props.textColor ? { color: props.textColor } : {}}>
          {props.title ? props.title : defaultTitle}
        </CPMText>
      )}
    </View>
  );
}

const style = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Platform.select({
      android: 10,
      ios: 30
    }),
    marginHorizontal: 30,
  },
});
