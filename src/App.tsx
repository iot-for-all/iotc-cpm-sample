import React from 'react';
import {enableScreens} from 'react-native-screens';
import {
  Provider as PaperProvider,
  DefaultTheme,
  configureFonts,
} from 'react-native-paper';
import Welcome from './screens/welcome';
import ConfigProvider, {ConfigContext} from './contexts/config';
import Registration from './screens/registration';
import Main from './screens/main';
import {StatusBar} from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import AuthProvider from './contexts/auth';
import UIProvider from './contexts/ui';
import {useContext} from 'react';

enableScreens();

const fontConfig: {} = {
  default: {
    regular: {
      fontFamily: 'Roboto',
      fontWeight: 'normal',
      fontSize: 14,
    },
    medium: {
      fontFamily: 'sans-serif-medium',
      fontWeight: 'normal',
    },
    light: {
      fontFamily: 'sans-serif-light',
      fontWeight: 'normal',
    },
    thin: {
      fontFamily: 'sans-serif-thin',
      fontWeight: 'normal',
    },
  },
};

const theme = {
  ...DefaultTheme,
  roundness: 2,
  colors: {
    ...DefaultTheme.colors,
    accent: '#75FBFD',
    primary: '#3783c5',
    background: 'transparent',
    text: '#1F529D',
    placeholder: '#1F529D',
  },
  fonts: configureFonts(fontConfig),
};

export default function App() {
  return (
    <PaperProvider theme={theme}>
      <AuthProvider>
        <ConfigProvider>
          <UIProvider>
            <NavigationContainer>
              <StatusBar backgroundColor="#00B1FF" />
              <Root />
            </NavigationContainer>
          </UIProvider>
        </ConfigProvider>
      </AuthProvider>
    </PaperProvider>
  );
}

const Root = React.memo(() => {
  const {state} = useContext(ConfigContext);
  if (state.centralClient !== undefined) {
    return <Main />;
  } else if (state.initialized) {
    return <Registration />;
  }
  return <Welcome />;
});
