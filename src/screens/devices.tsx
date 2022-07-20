import React, {useState, useEffect, useContext, useRef} from 'react';
import {View, ScrollView, StyleSheet, RefreshControl} from 'react-native';
import {Button, IconButton, ActivityIndicator} from 'react-native-paper';
import {Footer} from '../components/footer';
import DefaultStyles from '../styles';
import {
  Detail,
  Headline,
  Action,
  Name,
  CPMText,
} from '../components/typography';
import {NavigationProperty, Screens} from '../types';
import {TouchableOpacity} from 'react-native-gesture-handler';
import {useNavigation} from '@react-navigation/native';
import {ConfigContext} from '../contexts/config';
import {IHealthDevice, IHealthManager} from '../models';
import {Loading, GetConnectedHeader} from '../components/utils';
import {BleManager, DATA_AVAILABLE_EVENT} from '../health/ble';
import {SimulatedHealthManager} from '../health/simulated';
import {useHeaderTitle} from '../hooks/common';
import {CPMButton} from '../components/buttons';
import {useSimulated} from '../hooks/bluetoothHooks';
import {sendTelemetryData} from '../api/central';
import {useCallback} from 'react';

const NOT_FOUND_TITLE = 'Device could not be located';
const NOT_FOUND_TEXT =
  'Make sure your bluetooth is enabled and available for pairing or use a simulated device.';
const SIMULATED = 'Simulated';
const REAL = '';
const MY_DEVICE = 'My devices';

// on iOS some devices have no name so the uuid is shown.
// this can be quite long and text may overlap other fields.
// put ellipsis for the text
const MAX_NAME_LENGTH = 30;

function startScanProcess(
  manager: IHealthManager,
  onDeviceFound: (device: IHealthDevice) => void,
  onStop: () => void,
) {
  let timeout = 10000;
  manager.startScan(onDeviceFound);
  if (manager instanceof SimulatedHealthManager) {
    timeout = 3000;
  }
  setTimeout(() => {
    manager.stopScan();
    onStop();
  }, timeout);
}

export default function Devices() {
  const navigation = useNavigation<NavigationProperty>();
  const {state, dispatch} = useContext(ConfigContext);
  const [scanning, setScanning] = useState(false);
  const [devices, setDevices] = useState<IHealthDevice[] | null>(null);
  const simulated = useSimulated();

  useHeaderTitle('Devices');

  // If true, scan is in progress and focused, component is mounted and devices can be added.
  // If false, scanning asynchronous task will not add devices to the component as is unmounted
  const scanInProgress = useRef(true);

  const refresh = useCallback(() => {
    setDevices([]);
    setScanning(true);
    startScanProcess(
      state.healthManager as IHealthManager,
      (device: IHealthDevice) => {
        if (scanInProgress.current) {
          setDevices(current => {
            if (!current) {
              return [];
            }
            if (current.find(d => d.id === device.id)) {
              return current;
            }
            return [...current, device];
          });
        }
      },
      () => {
        if (scanInProgress.current) {
          setScanning(false);
        }
      },
    );
  }, [state.healthManager]);

  const connect = async function (deviceId: string) {
    if (!state.healthManager) {
      console.log(`No Health manager available`);
      return;
    }
    const dev = await state.healthManager.connect(deviceId);
    await dev.fetch();
    if (state.centralClient) {
      dev.addListener(
        DATA_AVAILABLE_EVENT,
        sendTelemetryData.bind(null, state.centralClient, dev.type === 'real'),
      );
    }
    dispatch({
      type: 'HEALTH_CONNECT',
      payload: dev,
    });
  };

  /**
   * Run when screen mounts. Initializes the HealthManager
   *
   */
  useEffect(() => {
    const initManager = async () => {
      if (state.healthManager) {
        refresh();
      } else {
        try {
          const payload = await BleManager.GetManager();
          dispatch({
            type: 'ACTIVATE',
            payload,
          });
        } catch (ex) {
          // Running on simulator or device without a bluetooth adapter
          console.log('Falling back to Simulated');
          const payload = new SimulatedHealthManager();
          dispatch({
            type: 'ACTIVATE',
            payload,
          });
        }
      }
    };
    initManager();
  }, [state.healthManager, dispatch, refresh]);

  useEffect(() => {
    if (state.device) {
      // device has been selected. navigate to insight
      navigation.navigate(Screens.INSIGHT_SCREEN);
    }
  }, [state.device, navigation]);

  /**
   * cleanup function. run when going back to previous screen
   */
  useEffect(() => {
    const resetManager = () => {
      scanInProgress.current = false;
      dispatch({
        type: 'UNACTIVATE',
        payload: null,
      });
    };
    return resetManager;
  }, [dispatch]);

  if (!state.healthManager || !devices) {
    return <Loading />;
  }

  return (
    <View style={style.container}>
      {scanning ? (
        <>
          <View
            style={{
              marginTop: 20,
              marginHorizontal: 10,
            }}
          >
            <GetConnectedHeader />
          </View>
          <View style={style.scan}>
            <ActivityIndicator size="large" style={{marginVertical: 30}} />
            <Headline>
              {simulated
                ? 'Getting simulated devices...'
                : 'Searching for devices...'}
            </Headline>
            <SimulatedButton refresh={refresh} />
          </View>
        </>
      ) : (
        <React.Fragment>
          <DeviceList devices={devices} refresh={refresh} connect={connect} />
        </React.Fragment>
      )}
      <Footer text="During this step, the phone is scanning for BLE devices set to pairing mode." />
    </View>
  );
}

function Device(props: {
  device: IHealthDevice;
  connect: (deviceId: string) => Promise<void>;
}) {
  const {connect, device} = props;
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        height: 65,
        marginHorizontal: 16,
        marginVertical: 5,
        padding: 20,
        ...DefaultStyles.elevated,
        backgroundColor: 'white',
      }}
    >
      <TouchableOpacity
        style={{flexDirection: 'column', justifyContent: 'center'}}
        onPress={async () => {
          await connect(device.id);
        }}
      >
        <Name style={DefaultStyles.itemName}>
          {device.name.length > MAX_NAME_LENGTH
            ? device.name.substring(0, MAX_NAME_LENGTH - 3) + '...'
            : device.name}
        </Name>
        <Detail>{device.type === 'simulated' ? SIMULATED : REAL}</Detail>
      </TouchableOpacity>
      <View
        style={{
          flex: 1,
          alignItems: 'flex-end',
        }}
      >
        {device.paired ? null : (
          <Action style={{fontWeight: 'bold'}}>PAIR</Action>
        )}
      </View>
    </View>
  );
}

function DeviceList(props: {
  devices: IHealthDevice[];
  connect: (deviceId: string) => Promise<void>;
  refresh: () => void;
}) {
  const [refreshing, setRefreshing] = useState(false);
  const {devices, refresh, connect} = props;
  if (devices.length == 0) {
    return <NotFound retry={refresh} />;
  }
  return (
    <View style={{flex: 4}}>
      <Counter value={devices.length} />
      <ScrollView
        style={{flex: 1}}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              refresh();
              // Hack! No need to restore refreshing state to false since
              // component will be unmounted by the end of the scan process
            }}
          />
        }
      >
        {devices.map(device => {
          return <Device key={device.id} device={device} connect={connect} />;
        })}
      </ScrollView>
    </View>
  );
}

function Counter(props: {value: number}) {
  return (
    <View style={{flexDirection: 'row', alignItems: 'center', padding: 10}}>
      <IconButton icon="bluetooth" size={30} />
      <View style={{flexDirection: 'column'}}>
        <Headline style={DefaultStyles.header}>{MY_DEVICE}</Headline>
        <Detail>{`${
          props.value && props.value > 0 ? props.value : 'No'
        } devices found`}</Detail>
      </View>
    </View>
  );
}

function NotFound(props: {retry: () => void}) {
  return (
    <View style={{flex: 4}}>
      <View style={DefaultStyles.centerFragment}>
        <IconButton icon="alert" size={60} />
      </View>
      <View
        style={{
          ...DefaultStyles.centerFragment,
          ...{justifyContent: 'space-evenly', marginHorizontal: 20},
        }}
      >
        <CPMText style={DefaultStyles.header}>{NOT_FOUND_TITLE}</CPMText>
        <CPMText style={{textAlign: 'center'}}>{NOT_FOUND_TEXT}</CPMText>
      </View>
      <View style={DefaultStyles.centerFragment}>
        <Button
          mode="contained"
          style={{...DefaultStyles.centeredButton, ...DefaultStyles.elevated}}
          onPress={props.retry}
        >
          <CPMText>TRY AGAIN</CPMText>
        </Button>
        <SimulatedButton refresh={props.retry} />
      </View>
    </View>
  );
}

const SimulatedButton = React.memo<{refresh: () => void}>(({refresh}) => {
  const {state, dispatch} = useContext(ConfigContext);
  const simulated = useSimulated();

  useEffect(() => {
    if (state.healthManager instanceof SimulatedHealthManager) {
      refresh(); // cleans up device list and start populating
    }
  }, [state.healthManager, refresh]);

  return (
    <CPMButton
      mode="contained"
      style={{
        ...DefaultStyles.centeredButton,
        ...DefaultStyles.elevated,
        display: simulated ? 'none' : 'flex',
      }}
      onPress={() => {
        const currentManager = state.healthManager;
        currentManager?.stopScan();
        const simManager = new SimulatedHealthManager();
        dispatch({
          type: 'ACTIVATE',
          payload: simManager,
        });
      }}
    >
      USE SIMULATED DEVICES
    </CPMButton>
  );
});

const style = StyleSheet.create({
  container: {
    flex: 4,
  },
  scan: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
