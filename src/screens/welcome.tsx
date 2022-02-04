import React from 'react';
import {View, StyleSheet} from 'react-native';
import {Text} from 'react-native-paper';
import LogoTitle from '../assets/logo_title.svg';
import LinearGradient from 'react-native-linear-gradient';
import ProgressCircleSnail from 'react-native-progress/CircleSnail';
import {useScreenDimensions} from 'hooks/layout';
import {useEffect} from 'react';
import {useContext} from 'react';
import {ConfigContext} from 'contexts/config';

const title = 'Welcome to connected care.';

const theme = {
  colors: {placeholder: 'white', text: 'white'},
};

export default React.memo(() => {
  const {screen} = useScreenDimensions();
  const {dispatch} = useContext(ConfigContext);

  useEffect(() => {
    setTimeout(() => {
      dispatch({
        type: 'INIT',
        payload: true,
      });
    }, 4000);
  }, [dispatch]);

  return (
    <LinearGradient colors={['#00B1FF', '#42B3B3']} style={style.container}>
      <View style={style.logo}>
        <LogoTitle />
        <Text theme={theme} style={style.logoSub}>
          {title}
        </Text>
        {/* <Text theme={theme} style={style.logoDetails}>
          {subTitle}
        </Text> */}
      </View>
      <ProgressCircleSnail
        style={style.progress}
        size={Math.floor(screen.width / 8)}
        indeterminate={true}
        thickness={3}
        color={'white'}
        spinDuration={1000}
        duration={1000}
      />
    </LinearGradient>
  );
});

const style = StyleSheet.create({
  container: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  logo: {
    alignItems: 'center',
    marginBottom: 50,
  },
  logoSub: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  logoDetails: {
    fontSize: 15,
    color: 'white',
  },
  form: {
    width: '80%',
    flex: 2,
    alignItems: 'center',
  },
  forgot: {
    textAlign: 'right',
    marginTop: 6,
  },
  text: {
    color: 'white',
    width: '100%',
    backgroundColor: 'transparent',
  },
  button: {
    width: 120,
    marginVertical: 50,
    backgroundColor: 'white',
  },
  progress: {
    marginVertical: 5,
  },
});
