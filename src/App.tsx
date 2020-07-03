import React, { useEffect } from 'react';
import { enableScreens } from 'react-native-screens';
import { Provider as PaperProvider, Theme, DefaultTheme, configureFonts, Portal } from "react-native-paper";
import Login from "./screens/login";
import ConfigProvider from './contexts/config';
import { Registration } from './screens/registration';
import { StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import Main from './screens/main';
import AuthProvider from './contexts/auth';
import UIProvider from './contexts/ui';

enableScreens();



const fontConfig: {} = {
    default: {
        regular: {
            fontFamily: 'Roboto',
            fontWeight: 'normal',
            fontSize: 14
        },
        medium: {
            fontFamily: 'sans-serif-medium',
            fontWeight: 'normal'
        },
        light: {
            fontFamily: 'sans-serif-light',
            fontWeight: 'normal'
        },
        thin: {
            fontFamily: 'sans-serif-thin',
            fontWeight: 'normal'
        },
    },
};


const theme: Theme = {
    ...DefaultTheme,
    roundness: 2,
    colors: {
        ...DefaultTheme.colors,
        accent: '#75FBFD',
        primary: '#3783c5',
        background: 'transparent',
        text: '#1F529D',
        placeholder: '#1F529D'
    },
    fonts: configureFonts(fontConfig)

};

export default function App() {
    return (
        <PaperProvider theme={theme}>
            <AuthProvider>
                <ConfigProvider>
                    <UIProvider>
                        <NavigationContainer>
                            <StatusBar backgroundColor='#00B1FF' />
                            <Login />
                            <Registration />
                            <Main />
                        </NavigationContainer>
                    </UIProvider>
                </ConfigProvider>
            </AuthProvider>
        </PaperProvider>)
}