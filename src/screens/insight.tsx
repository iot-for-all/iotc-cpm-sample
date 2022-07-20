import React, {useContext, useEffect, useState} from 'react';
import {View, StyleSheet} from 'react-native';
import {ItemData} from '../models';
import DefaultStyles from '../styles';
import {Footer} from '../components/footer';
import VitalsLogo from '../assets/vitals_logo.svg';
import {Detail, Headline, Name} from '../components/typography';
import {LineChart} from 'react-native-charts-wrapper';
import {Loading, getRandomColor} from '../components/utils';
import {DrawerProperty, ExtendedLineData} from '../types';
import {useNavigation} from '@react-navigation/native';
import {ConfigContext} from '../contexts/config';
import {TouchableOpacity} from 'react-native-gesture-handler';
import {IconButton} from 'react-native-paper';
import {DATA_AVAILABLE_EVENT} from '../health/ble';
import {useHeaderTitle} from '../hooks/common';
import {UIContext} from '../contexts/ui';
import {useCallback} from 'react';

const summary =
  'Your average body temperature is less than yesterday and your heart rate is nearly the same.';
const footer =
  'This view is showing real-time data from the paired device or Google Fit data. To restart this sample walkthrough, exit and relaunch the app. To get started with building your own app, visit our GitHub repository.';

export default function Insight() {
  const {state, dispatch} = useContext(ConfigContext);
  const {dispatch: uiDispatch} = useContext(UIContext);
  const [start, setStart] = useState<number>(Date.now());
  const {
    openDrawer,
    setParams: setDrawerParams,
    addListener: addDrawerListener,
  } = useNavigation<DrawerProperty>();
  const [data, setData] = useState<ExtendedLineData>({
    dataSets: [],
  });
  const timestamp = Date.now() - start;
  const [stopped, setStopped] = useState(false);

  useHeaderTitle('Insight');

  // const timeoutLoading = useTimer(6);
  // const [showError, setShowError] = useState(true);

  /**
   *
   * @param itemdata Current sample for the item
   * @param startTime Start time of the sampling. Must be the same value used as "since" param in the chart
   * @param setData Dispatch to update dataset with current sample
   */
  const updateData = useCallback(
    (item: ItemData) => {
      if (stopped) {
        return;
      }
      let itemToProcess: ItemData[] = [item];
      if (typeof item.value !== 'string' && typeof item.value !== 'number') {
        // data is composite
        itemToProcess = Object.keys(item.value).map(i => ({
          itemId: `${item.itemId}.${i}`,
          value: item.value[i],
          itemName: `${item.itemName}.${i}`,
        }));
      }

      setData(currentDataSet => {
        let dataSets = currentDataSet.dataSets;
        itemToProcess.forEach(item => {
          const itemDataIndex = dataSets.findIndex(
            d => d.itemId === item.itemId,
          );
          const newSample = {x: Date.now() - start, y: item.value};
          if (itemDataIndex === -1) {
            // current item is not in the dataset yet
            dataSets = [
              ...dataSets,
              {
                itemId: item.itemId,
                values: [newSample],
                label: item.itemName ? item.itemName : item.itemId,
                config: {color: getRandomColor()},
              },
            ];
            return;
          }
          if (
            dataSets[itemDataIndex].values?.some(v => v.x && v.x >= newSample.x)
          ) {
            // remove old
            return {...currentDataSet, dataSets};
          }
          dataSets = [
            ...dataSets.slice(0, itemDataIndex),
            {
              ...dataSets[itemDataIndex],
              values: [...dataSets[itemDataIndex].values!, newSample].splice(
                -20,
              ),
            },
            ...dataSets.slice(itemDataIndex + 1),
          ];
        });
        return {...currentDataSet, dataSets};
      });
    },
    [start, stopped],
  );

  useEffect(() => {
    setStart(Date.now());
    setDrawerParams({
      title: 'Health Insight',
    });
    uiDispatch({
      type: 'SET',
      payload: {
        right: () => {
          openDrawer();
        },
      },
    });
    openDrawer();
  }, [openDrawer, setDrawerParams, uiDispatch]);

  useEffect(() => {
    if (state.device) {
      state.device.addListener(DATA_AVAILABLE_EVENT, updateData);
      return () => {
        state.device!.removeListener(DATA_AVAILABLE_EVENT, updateData);
      };
    }
  }, [state.device, updateData]);

  /**
   * Manage component unmount. Remove all listeners
   */
  useEffect(() => {
    const unsubscribe = addDrawerListener('blur', async () => {
      if (state.device) {
        await state.device.disconnect();

        // send disconnection event
        dispatch({
          type: 'HEALTH_DISCONNECT',
          payload: null,
        });
      }
    });
    return unsubscribe;
  }, [addDrawerListener, state, dispatch]);

  useEffect(() => {
    const stopFn = () => setStopped(true);
    return stopFn;
  }, [setStopped]);

  // if (timeoutLoading) {
  //     return (<View style={style.container}>
  //         <ErrorDialog visible={showError} title='Error' text='Timeout getting data from provider.' setVisible={setShowError} />
  //     </View>)
  // }
  if (!state.device || data.dataSets.length === 0) {
    return <Loading />;
  }

  return (
    <View style={style.container}>
      <View style={{...DefaultStyles.elevated, ...style.chart}}>
        <View style={{flex: 1, flexDirection: 'row', alignItems: 'center'}}>
          <VitalsLogo style={{marginHorizontal: 20, padding: 20}} />
          <View style={{flexDirection: 'column'}}>
            <Headline style={DefaultStyles.header}>Vitals</Headline>
            <Detail>Today</Detail>
          </View>
        </View>
        <LineChart
          style={style.chartBox}
          chartDescription={{text: ''}}
          touchEnabled={true}
          dragEnabled={true}
          scaleEnabled={true}
          pinchZoom={true}
          extraOffsets={{bottom: 20}}
          legend={{wordWrapEnabled: true}}
          xAxis={{
            position: 'BOTTOM',
            axisMaximum: timestamp + 500,
            axisMinimum: timestamp - 10000,
            valueFormatter: 'date',
            since: start,
            valueFormatterPattern: 'HH:mm:ss',
            timeUnit: 'MILLISECONDS',
          }}
          data={data}
        />
        <View style={style.summary}>
          <Detail style={{marginBottom: 20}}>{summary}</Detail>
          <TouchableOpacity
            onPress={() => {
              openDrawer();
            }}
          >
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginLeft: -15,
              }}
            >
              <IconButton icon="chevron-right" />
              <Name>SYNC OPTIONS</Name>
            </View>
          </TouchableOpacity>
        </View>
      </View>
      <Footer text={footer} />
    </View>
  );
}

const style = StyleSheet.create({
  container: {
    flex: 6,
  },
  chart: {
    flex: 5,
    marginTop: 20,
    backgroundColor: 'white',
    marginHorizontal: 5,
  },
  chartBox: {
    flex: 3,
    backgroundColor: '#F3F2F1',
  },
  summary: {
    flex: 1,
    padding: 20,
  },
});
