import { Route } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { DrawerNavigationProp } from '@react-navigation/drawer';
import { LineData, LineValue, LineDatasetConfig } from "react-native-charts-wrapper";
import { ItemData } from "./models";

export const CONSTANTS = {
    Screens: {
        'DEVICES_SCREEN': 'Devices',
        'INSIGHT_SCREEN': 'Insight',
        'HOME_SCREEN': 'Home',
        'PROVIDERS_SCREEN': 'Health Provider'
    }
}

// Type for getting the values of an object (lookup)
export type valueof<T> = T[keyof T];

export type ReactDispatch<T> = React.Dispatch<React.SetStateAction<T>>;
export type ContextDispatch<T> = React.Dispatch<T>;

/**
 * Parameters available for all routes
 */
export type NavigationParams = {
    title?: string
}

/**
 * Defines type of screens
 */
export type NavigationScreens = {
    [k in valueof<typeof CONSTANTS.Screens>]: NavigationParams | undefined
}

/**
 * Defines type of parameters shared between routes
 */
export type RouteParams<T extends string> = Omit<Route<T>, 'params'> & {
    params?: NavigationParams
};

/**
 * Defines type of navigator properties
 */
export type NavigationProperty = StackNavigationProp<NavigationScreens, string>;

export type DrawerProperty = DrawerNavigationProp<any, string>;


/**
 * Chart typings
 */
export interface ExtendedLineData extends LineData {
    dataSets: {
        itemId: string,
        values?: Array<number | LineValue>,
        label?: string,
        config?: LineDatasetConfig
    }[]
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
    Workout: 'Workout'
} as const;

export type GoogleFitStepResult = {
    source: string,
    steps: {
        date: string,
        value: number
    }[]
}

