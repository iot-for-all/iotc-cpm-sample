import HealthKit, { HealthKitPermissions as KitPermissions, HealthUnit } from 'rn-apple-healthkit';
import { Permission } from 'react-native';
import { HealthRealTimeData } from './types';
declare module 'rn-apple-healthkit' {
  const Permissions = {
    ActiveEnergyBurned: "ActiveEnergyBurned",
    AppleExerciseTime: "AppleExerciseTime",
    BasalEnergyBurned: "BasalEnergyBurned",
    BiologicalSex: "BiologicalSex",
    BloodGlucose: "BloodGlucose",
    BloodPressureDiastolic: "BloodPressureDiastolic",
    BloodPressureSystolic: "BloodPressureSystolic",
    BodyFatPercentage: "BodyFatPercentage",
    BodyMass: "BodyMass",
    BodyMassIndex: "BodyMassIndex",
    BodyTemperature: "BodyTemperature",
    DateOfBirth: "DateOfBirth",
    Biotin: "Biotin",
    Caffeine: "Caffeine",
    Calcium: "Calcium",
    Carbohydrates: "Carbohydrates",
    Chloride: "Chloride",
    Cholesterol: "Cholesterol",
    Copper: "Copper",
    EnergyConsumed: "EnergyConsumed",
    FatMonounsaturated: "FatMonounsaturated",
    FatPolyunsaturated: "FatPolyunsaturated",
    FatSaturated: "FatSaturated",
    FatTotal: "FatTotal",
    Fiber: "Fiber",
    Folate: "Folate",
    Iodine: "Iodine",
    Iron: "Iron",
    Magnesium: "Magnesium",
    Manganese: "Manganese",
    Molybdenum: "Molybdenum",
    Niacin: "Niacin",
    PantothenicAcid: "PantothenicAcid",
    Phosphorus: "Phosphorus",
    Potassium: "Potassium",
    Protein: "Protein",
    Riboflavin: "Riboflavin",
    Selenium: "Selenium",
    Sodium: "Sodium",
    Sugar: "Sugar",
    Thiamin: "Thiamin",
    VitaminA: "VitaminA",
    VitaminB12: "VitaminB12",
    VitaminB6: "VitaminB6",
    VitaminC: "VitaminC",
    VitaminD: "VitaminD",
    VitaminE: "VitaminE",
    VitaminK: "VitaminK",
    Zinc: "Zinc",
    Water: "Water",
    DistanceCycling: "DistanceCycling",
    DistanceSwimming: "DistanceSwimming",
    DistanceWalkingRunning: "DistanceWalkingRunning",
    FlightsClimbed: "FlightsClimbed",
    HeartRate: "HeartRate",
    Height: "Height",
    LeanBodyMass: "LeanBodyMass",
    MindfulSession: "MindfulSession",
    NikeFuel: "NikeFuel",
    RespiratoryRate: "RespiratoryRate",
    SleepAnalysis: "SleepAnalysis",
    StepCount: "StepCount",
    Steps: "Steps",
    Weight: "Weight",
    Workout: "Workout"
  }


  export type RealTimeData = keyof typeof HealthRealTimeData;


  type valueof<T> = T[keyof T];

  export interface HealthKitPermissions {
    permissions: {
      read: valueof<typeof Permissions>[];
      write: valueof<typeof Permissions>[];
    };
  }

  export type SampleResult = { value: number, startDate: string, endDate: string };
  export type BloodPressureResult = { bloodPressureSystolicValue: number, bloodPressureDiastolicValue: number, startDate: string, endDate: string };

  export type SampleOptions = {
    unit?: string,
    startDate?: string
    endDate?: string,
    ascending?: boolean,
    limit?: number
  };

  export interface AppleHealthKit extends HealthKit {
    Constants: {
      Permissions: { [k in keyof typeof Permissions]: string },
      Units: HealthUnit,
    },
    initStepCountObserver(input: any, callback: (data?: any) => any),
    setObserver(config: { type: RealTimeData }),
    getHeartRateSamples(options: SampleOptions, callback: (err: Object, results: SampleResult[]) => void),
    getBodyTemperatureSamples(options: SampleOptions, callback: (err: Object, results: SampleResult[]) => void),
    getBloodPressureSamples(options: SampleOptions, callback: (err: Object, results: BloodPressureResult[]) => void)
  }

  const appleHealthKit: AppleHealthKit;
  export default appleHealthKit;
}

declare module "*.svg" {
  import { SvgProps } from "react-native-svg";
  const content: React.FC<SvgProps>;
  export default content;
}

