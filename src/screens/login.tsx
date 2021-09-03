import React, {useState} from 'react';
import {View, StyleSheet} from 'react-native';
import {TextInput, Text, Button} from 'react-native-paper';
import {Footer} from '../components/footer';
import LogoTitle from '../assets/logo_title.svg';
import LinearGradient from 'react-native-linear-gradient';
import {login} from '../api/auth';
import {useUser} from '../hooks/auth';
import {ReactDispatch} from '../types';
import {CPMText} from '../components/typography';

const footerText =
  'This generates and stores the patient ID information that will be mapped to a device in the Azure API for FHIR.';
const forgot_passord = 'Forgot password?';
const title = 'Welcome to connected care.';

const theme = {
  colors: {placeholder: 'white', text: 'white'},
};

export default function Login() {
  const [user, setUser] = useUser();
  if (user) {
    return null;
  }
  return (
    <LinearGradient colors={['#00B1FF', '#42B3B3']} style={style.container}>
      <Logo />
      <Form
        onSubmit={async (user, password) => {
          const providerId = await login(user, password);
          setUser({id: providerId});
        }}
      />
      <Footer text={footerText} textColor="white" />
    </LinearGradient>
  );
}

function Logo() {
  return (
    <View style={style.logo}>
      <LogoTitle />
      <Text theme={theme} style={style.logoSub}>
        {title}
      </Text>
    </View>
  );
}

function Form(props: {
  onSubmit: (user: string, password: string) => void | Promise<void>;
}) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  return (
    <View style={style.form}>
      <Input name="Username" value={username} setValue={setUsername} />
      <Input
        name="Password"
        hidden={true}
        value={password}
        setValue={setPassword}
      />
      <CPMText style={{...style.forgot, ...style.text}}>
        {forgot_passord}
      </CPMText>
      <Button
        mode="outlined"
        style={style.button}
        onPress={() => props.onSubmit(username, password)}>
        Login
      </Button>
    </View>
  );
}

function Input(props: {
  name: string;
  value: string;
  setValue: ReactDispatch<string>;
  hidden?: boolean;
}) {
  const [focus, setFocus] = useState(false);
  return (
    <TextInput
      secureTextEntry={props.hidden}
      style={style.text}
      placeholder={focus ? '' : props.name}
      value={props.value}
      onChangeText={text => props.setValue(text)}
      underlineColor="white"
      theme={theme}
      onFocus={() => setFocus(true)}
      onBlur={() => setFocus(false)}
    />
  );
}

const style = StyleSheet.create({
  container: {
    alignItems: 'center',
    flex: 1,
  },
  logo: {
    flex: 2,
    alignItems: 'center',
    justifyContent: 'space-evenly',
  },
  logoSub: {
    fontSize: 20,
    fontWeight: 'bold',
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
});
