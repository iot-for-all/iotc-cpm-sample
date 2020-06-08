import React, { useState, useEffect, useContext } from 'react';
import { View, StyleSheet, BackHandler, Dimensions, ViewStyle } from "react-native";
import { Text, Button, TextInput, IconButton, ActivityIndicator } from 'react-native-paper';
import { Footer } from '../components/footer';
import QRCodeScanner, { Event } from 'react-native-qrcode-scanner'
import { ConfigContext } from '../contexts/config';
import { useUser } from '../hooks/auth';
import { DecryptCredentials, IoTCClient, IOTC_CONNECT, IOTC_LOGGING } from 'react-native-azure-iotcentral-client';
import { Loading } from '../components/utils';
import { getCredentialsFromNumericCode } from '../api/central';
import QRCodeMask from '../components/qrcodeMask';
import { Headline, Name } from '../components/typography';
import { useScreenDimensions } from '../hooks/layout';
import { CPMButton } from '../components/buttons';

const title = 'GETTING STARTED';
const instructions = 'How would you like to verify your device?'
const numeric = {
    instructions: 'Please enter your verification code.',
    placeholder: 'Enter code',
    button: 'VERIFY'
}
const code = 'ENTER A CODE';
const scan = 'SCAN A CODE';
const footerText = 'Depending on the preferred user flow, the backend provisioning information can either be mapped to a code or stored in a QR code.';
const qrcodeFooterText = 'After scanning the QR code, the IoT Central provisioning credentials along with a set of cloud properties such as hospital name will be stored in the app and the device ID to patient mapping will be sent to the Azure API for FHIR.';

interface IVerificationProps {
    onVerify(data: any): Promise<void>
}

interface IRegistrationProps extends IVerificationProps {
    onClose(): void
}


export function Registration() {
    const { state, dispatch } = useContext(ConfigContext);
    const [user, setUser] = useUser();
    const [numeric, setNumeric] = useState(false);
    const [qr, setQR] = useState(false);
    const [loading, setLoading] = useState(false);


    const onVerify = async (data: string) => {
        if (user == null) {
            throw new Error('User not logged in');
        }
        setLoading(true);
        const creds = DecryptCredentials(data, user.id);
        // connect to IoTCentral before passing over
        let iotc = new IoTCClient(creds.deviceId, creds.scopeId, IOTC_CONNECT.DEVICE_KEY, creds.deviceKey);
        iotc.setModelId(creds.modelId);
        iotc.setLogging(IOTC_LOGGING.ALL);
        try {
            await iotc.connect();
        }
        catch (ex) {
            throw ex;
        }
        dispatch({
            type: 'CONNECT',
            payload: iotc
        });
        setLoading(false);
    }

    const onBack = () => {
        setQR(false);
        setNumeric(false);
        return true;
    }

    useEffect(() => {
        BackHandler.addEventListener('hardwareBackPress', onBack);
    }, [])

    if (!user || state.centralClient !== undefined) {
        return (null);
    }
    if (loading) {
        return (<View style={style.loading}>
            <ActivityIndicator size='large' style={{ marginVertical: 30 }} />
            <Headline>Connecting to Azure IoTCentral ...</Headline>
        </View>);
    }

    if (numeric) {
        return (<NumericCode onVerify={onVerify} onClose={onBack} />)
    }
    if (qr) {
        return (<QRCode onVerify={onVerify} onClose={onBack} />);
    }
    return (<View style={{ flex: 4, ...style.container }}>
        <View style={{ flex: 1, justifyContent: 'center' }}>
            <Name style={style.title}>{title}</Name>
        </View>
        <View style={{ flex: 1, justifyContent: 'center' }}>
            <Text style={style.instructions}>{instructions}</Text>
        </View>
        <View style={{ flex: 2 }}>
            <CPMButton mode='outlined' style={style.button} onPress={() => setNumeric(true)}>{code}</CPMButton>
            <CPMButton mode='contained' style={{ marginBottom: 50, ...style.button }} onPress={() => setQR(true)}>{scan} </CPMButton>
            <SimulatedButton />
        </View>
        <Footer text={footerText} />
    </View>)
}

function NumericCode(props: IRegistrationProps) {
    const [data, setData] = useState('');
    return (<View style={{ flex: 2, ...style.container }}>
        <IconButton icon='arrow-left' onPress={props.onClose} size={30} style={{ marginTop: 40, alignSelf: 'flex-start' }} />
        <View style={{ flex: 1, justifyContent: 'center' }}>
            <Text style={style.instructions}>{numeric.instructions}</Text>
        </View>
        <View style={{ flex: 1 }}>
            {/**
             * Multiline set to true to keep input linked to the bottom line,
             * otherwise it will take all space of flex container
             */}
            <TextInput placeholder={numeric.placeholder} value={data} multiline={true} onChangeText={setData}></TextInput>
            <CPMButton mode='contained' style={style.button} onPress={async () => {
                await props.onVerify(await getCredentialsFromNumericCode(data));
            }}>{numeric.button}</CPMButton>
        </View>
        <SimulatedButton />
        <Footer text={footerText} />
    </View>)
}

function QRCode(props: IRegistrationProps) {
    const { screen, orientation } = useScreenDimensions();
    return (
        <View style={{ ...style.container, position: 'relative' }}>
            <IconButton icon='arrow-left' onPress={props.onClose} size={30} color='white' style={{ position: 'absolute', alignSelf: 'flex-start', top: 40, zIndex: 2 }} />
            <QRCodeScanner onRead={async (e: Event) => {
                await props.onVerify(e.data);
            }}
                customMarker={
                    <View style={{ justifyContent: 'center' }}>
                        <QRCodeMask />
                        <Text style={{ ...style.qrtext, ...style.center }}>Move closer to scan</Text>
                    </View>
                }
                showMarker={true}
                cameraStyle={{ height: screen.height + 20, width: screen.width, ...(orientation === 'portrait' ? { top: -200 } : {}) }}
                bottomContent={<>
                    <SimulatedButton textColor='white' />
                </>}
            />
            <Footer text={qrcodeFooterText} textColor='white' />
        </View>
    )
}

function SimulatedButton(props: { textColor?: string }) {
    const { dispatch } = useContext(ConfigContext);
    const { screen, orientation } = useScreenDimensions();

    const viewStyle: ViewStyle = orientation == 'portrait' ? { flex: 1 } : { position: 'absolute', top: screen.height / 2, right: 10 };
    return (
        <View style={{ alignItems: 'center', ...viewStyle }}>
            <Text style={props.textColor ? { color: props.textColor } : {}}>Don't have a code?</Text>
            <CPMButton style={style.button} mode='contained' onPress={() => {
                // set simulation. data will not be sent to IoTCentral
                dispatch({
                    type: 'CONNECT',
                    payload: null
                });
            }}>Use simulated code</CPMButton>
        </View>);
}

const style = StyleSheet.create({
    container: {
        alignItems: 'center',
        marginHorizontal: 30,
        flex: 1
    },
    title: {
        fontWeight: 'bold',
        textAlign: 'center'
    },
    instructions: {
        fontSize: 24,
        textAlign: 'center'
    },
    button: {
        alignSelf: 'center',
        width: 230,
        marginVertical: 20
    },
    center: {
        position: 'absolute',
        top: '50%',
        bottom: 0,
        left: 0,
        right: 0
    },
    qrtext: {
        fontSize: 15,
        color: 'white',
        marginBottom: 20,
        textAlign: 'center'
    },
    loading: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    }
})