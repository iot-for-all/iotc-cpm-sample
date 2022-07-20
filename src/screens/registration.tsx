import React, {useState, useContext} from 'react';
import {View, StyleSheet, ViewStyle} from 'react-native';
import {IconButton, ActivityIndicator} from 'react-native-paper';
import {Footer} from '../components/footer';
import QRCodeScanner from 'react-native-qrcode-scanner';
import {BarCodeReadEvent} from 'react-native-camera';
import {ConfigContext} from '../contexts/config';
import {
  DecryptCredentials,
  IoTCClient,
  IoTCCredentials,
  IOTC_CONNECT,
  IOTC_LOGGING,
} from 'react-native-azure-iotcentral-client';
import {ErrorDialog} from '../components/utils';
import QRCodeMask from '../components/qrcodeMask';
import {Headline, CPMText, Name} from '../components/typography';
import {useScreenDimensions} from '../hooks/layout';
import {CPMButton} from '../components/buttons';

export type Event = BarCodeReadEvent;

const MODEL_ID = '';
const title = 'GETTING STARTED';
const instructions =
  'Scan a QR Code to authenticate to a device in IoT Central or use a simulated connection to skip sending data to the cloud.';
const scan = 'SCAN';
const simulation = 'USE SIMULATION';
const footerText =
  'Depending on the preferred user flow, the backend provisioning information can either be mapped to a code or stored in a QR code.';
const qrcodeFooterText =
  'After scanning the QR code, the IoT Central provisioning credentials along with a set of cloud properties such as hospital name will be stored in the app and the device ID to patient mapping will be sent to the Azure API for FHIR.';

interface IVerificationProps {
  onVerify(data: any): Promise<void>;
}

interface IRegistrationProps extends IVerificationProps {
  onClose(): void;
}

function Loading() {
  return (
    <View style={style.loading}>
      <ActivityIndicator size="large" style={{marginVertical: 30}} />
      <Headline>Connecting to Azure IoT Central ...</Headline>
    </View>
  );
}

export default React.memo(() => {
  const {dispatch} = useContext(ConfigContext);
  // const [user] = useUser();
  // const [numeric, setNumeric] = useState(false);
  const [qr, setQR] = useState(false);

  const onVerify = async (data: string) => {
    const creds: IoTCCredentials = DecryptCredentials(data);
    // connect to IoTCentral before passing over
    let iotc = new IoTCClient(
      creds.deviceId!,
      creds.scopeId!,
      IOTC_CONNECT.DEVICE_KEY,
      creds.deviceKey!,
    );

    iotc.setModelId(MODEL_ID);
    iotc.setLogging(IOTC_LOGGING.ALL);
    await iotc.connect();
    dispatch({
      type: 'CONNECT',
      payload: iotc,
    });
  };

  const onBack = () => {
    setQR(false);
    return true;
  };

  // useEffect(() => {
  //   BackHandler.addEventListener('hardwareBackPress', onBack);
  //   return () => {
  //     BackHandler.removeEventListener('hardwareBackPress', onBack);
  //   };
  // }, []);

  // if (!user || state.centralClient !== undefined) {
  //   return null;
  // }

  // if (numeric) {
  //   return <NumericCode onVerify={onVerify} onClose={onBack} />;
  // }
  if (qr) {
    return <QRCode onVerify={onVerify} onClose={onBack} />;
  }
  return (
    <View style={{flex: 4, ...style.container}}>
      <View style={{flex: 1, justifyContent: 'center'}}>
        <Name style={style.title}>{title}</Name>
      </View>
      <View style={{flex: 1, justifyContent: 'center'}}>
        <CPMText style={{textAlign: 'center'}}>{instructions}</CPMText>
      </View>
      <View style={{flex: 2}}>
        <CPMButton
          mode="contained"
          style={{marginBottom: 50, ...style.button}}
          onPress={() => setQR(true)}
        >
          {scan}
        </CPMButton>
        <SimulatedButton />
      </View>
      <Footer text={footerText} />
    </View>
  );
});

function QRCode(props: IRegistrationProps) {
  const {screen} = useScreenDimensions();
  const [loading, setLoading] = useState(false);
  const [errorVisible, setErrorVisible] = useState(false);

  if (loading) {
    return <Loading />;
  }
  return (
    <View style={{...style.container, flex: 2, position: 'relative'}}>
      <IconButton
        icon="arrow-left"
        onPress={props.onClose}
        size={30}
        color="white"
        style={{
          position: 'absolute',
          alignSelf: 'flex-start',
          top: 40,
          zIndex: 2,
        }}
      />
      <QRCodeScanner
        onRead={async (e: Event) => {
          setLoading(true);
          try {
            await props.onVerify(e.data);
          } catch (e) {
            console.log(e);
            throw e;
            setLoading(false);
            setErrorVisible(true);
          }
        }}
        customMarker={
          <View style={{marginTop: -(screen.width / 2)}}>
            <QRCodeMask />
            <CPMText style={{...style.qrtext, ...style.center}}>
              Move closer to scan
            </CPMText>
          </View>
        }
        showMarker={true}
        topViewStyle={{flex: 0, height: 0}}
        cameraStyle={{height: screen.height + 20, width: screen.width}}
        bottomContent={
          <View style={{flex: 2, justifyContent: 'flex-end'}}>
            <SimulatedButton textColor="white" />
            <Footer text={qrcodeFooterText} textColor="white" />
          </View>
        }
      />
      <ErrorDialog
        title="Error"
        text="Failed to parse inserted code. Try again or use a simulated connection"
        visible={errorVisible}
        setVisible={val => {
          setErrorVisible(val);
          setLoading(val);
        }}
      />
    </View>
  );
}

function SimulatedButton(props: {textColor?: string}) {
  const {dispatch} = useContext(ConfigContext);
  const {orientation} = useScreenDimensions();

  const viewStyle: ViewStyle = orientation == 'portrait' ? {} : {};
  return (
    <View style={{alignItems: 'center', ...viewStyle}}>
      <CPMText
        style={props.textColor ? {color: props.textColor} : {}}
      ></CPMText>
      <CPMButton
        style={style.button}
        mode="outlined"
        onPress={() => {
          // set simulation. data will not be sent to IoTCentral
          dispatch({
            type: 'CONNECT',
            payload: null,
          });
        }}
      >
        {simulation}
      </CPMButton>
    </View>
  );
}

const style = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginHorizontal: 30,
  },
  title: {
    fontWeight: 'bold',
    textAlign: 'center',
  },
  instructions: {
    fontSize: 24,
    textAlign: 'center',
  },
  button: {
    alignSelf: 'center',
    width: 230,
    height: 40,
    marginVertical: 20,
  },
  center: {
    position: 'absolute',
    top: '50%',
    bottom: 0,
    left: 0,
    right: 0,
  },
  qrtext: {
    fontSize: 15,
    color: 'white',
    marginBottom: 20,
    textAlign: 'center',
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
