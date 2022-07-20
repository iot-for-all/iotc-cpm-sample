import React from 'react';
import {Text} from 'react-native-paper';
import {TextProps} from 'react-native';
import {normalize} from '../utils';

interface Props extends TextProps {
  children?: any;
  theme?: any;
}

export function Headline(props: Props) {
  const {children, style, ...textProps} = props;
  return (
    <Text
      style={[style, {fontSize: normalize(20), fontWeight: 'bold'}]}
      {...textProps}
    >
      {props.children}
    </Text>
  );
}

export function CPMText(props: Props) {
  const {children, style, ...textProps} = props;
  return (
    <Text
      style={[style, {fontSize: normalize(14), fontStyle: 'normal'}]}
      {...textProps}
    >
      {props.children}
    </Text>
  );
}

export function Name(props: Props) {
  const {children, style, ...textProps} = props;
  return (
    <Text
      style={[
        style,
        {
          fontSize: normalize(14),
          fontWeight: 'bold',
          fontStyle: 'normal',
          letterSpacing: 1.15,
        },
      ]}
      {...textProps}
    >
      {props.children}
    </Text>
  );
}

export function Item(props: Props) {
  const {children, style, ...textProps} = props;
  return (
    <Text
      style={[
        style,
        {fontSize: normalize(14), fontWeight: 'bold', fontStyle: 'normal'},
      ]}
      {...textProps}
    >
      {props.children}
    </Text>
  );
}

export function Detail(props: Props) {
  const {children, style, ...textProps} = props;

  return (
    <Text
      style={[style, {fontSize: normalize(14), color: '#666666'}]}
      {...textProps}
    >
      {props.children}
    </Text>
  );
}

export function Action(props: Props) {
  const {children, style, ...textProps} = props;

  return (
    <Text
      style={[style, {fontSize: normalize(14), color: '#00B1FF'}]}
      {...textProps}
    >
      {props.children}
    </Text>
  );
}
