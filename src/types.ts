import {StackNavigationProp} from '@react-navigation/stack';
import {DrawerNavigationProp} from '@react-navigation/drawer';
import {
  LineData,
  LineValue,
  LineDatasetConfig,
} from 'react-native-charts-wrapper';
import {ItemData} from './models';

export const Screens = {
  DEVICES_SCREEN: 'Devices',
  INSIGHT_SCREEN: 'Insight',
  HOME_SCREEN: 'Home',
  PROVIDERS_SCREEN: 'Health Provider',
};

export const DrawerScreens = {
  MAIN: 'Main',
};
// Type for getting the values of an object (lookup)
export type valueof<T> = T[keyof T];

export type ReactDispatch<T> = React.Dispatch<React.SetStateAction<T>>;
export type ContextDispatch<T> = React.Dispatch<T>;

/**
 * Parameters available for all routes
 */
export type NavigationParams = {
  title?: string;
  backTitle?: string;
  titleColor?: string;
  headerLeft?: any;
  icon?: {
    name: string;
    type: string;
  };
  previousScreen?: string;
};

/**
 * Defines type of screens
 */
export type NavigationScreens = {
  [k in valueof<typeof Screens>]: NavigationParams | undefined;
};

export type DrawerNavigationScreens = {
  [k in valueof<typeof DrawerScreens>]: NavigationParams | undefined;
};

export type ScreenNames = typeof Screens[keyof typeof Screens];
export type DrawerScreenNames =
  typeof DrawerScreens[keyof typeof DrawerScreens];
/**
 * Defines type of navigator properties
 */
export type NavigationProperty = StackNavigationProp<
  NavigationScreens,
  ScreenNames
>;

export type DrawerProperty = DrawerNavigationProp<
  DrawerNavigationScreens,
  DrawerScreenNames
>;

/**
 * Chart typings
 */
export interface ExtendedLineData extends LineData {
  dataSets: {
    itemId: string;
    values?: Array<LineValue>;
    label?: string;
    config?: LineDatasetConfig;
  }[];
}

export type ChartUpdateCallback = (itemdata: ItemData) => void;

/**
 * Health typings
 */

export const HealthRealTimeData = {
  Walking: 'Walking',
  StairClimbing: 'StairClimbing',
  Running: 'Running',
  Cycling: 'Cycling',
  Workout: 'Workout',
} as const;

export type GoogleFitStepResult = {
  source: string;
  steps: {
    date: string;
    value: number;
  }[];
};

export type GoogleFitBloodPressureResult = {
  systolic: number;
  diastolic: number;
  endDate: string;
  startDate: string;
  day: string;
};
