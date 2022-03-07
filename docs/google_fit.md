# Google Fit

## 1. Add Item

To enable telemetries, add an entry to the _GOOGLE_ITEMS_ enum in [_googleFit.ts_](../src/health/googleFit.ts#L27).

```ts
enum GOOGLE_ITEMS {
  STEPS = 'steps',
  BLOOD_PRESSURE_SYSTOLIC = 'bloodPressureSystolic',
  BLOOD_PRESSURE_DIASTOLIC = 'bloodPressureDiastolic',
  ...
}
```

## 2. Add types

To leverage type definitions, add result types to [_types.ts_](../src/types.ts).
Follow specs from the official documentation of the [_react-native-google-fit_](https://github.com/StasDoskalenko/react-native-google-fit#usage) library for available items and result types.

## 3. Add data handlers

Each fit scope requires a different function to be called in order to fetch samples.
Then add handling code for the specific item by adding a case in [_googleFit.ts_](../src/health/googleFit.ts#L183).

```ts
case GOOGLE_ITEMS.STEPS:
    results = (await GoogleFit.getDailyStepCountSamples({
    startDate: startDate.toISOString(),
    endDate: new Date().toISOString(),
    })) as GoogleFitStepResult[];
    results.forEach(result => {
    ...
    ...
    this.eventEmitter.emit(DATA_AVAILABLE_EVENT, {
    itemId: item.id,
    value: item.value ?? 0,
    itemName: item.name,
    });
    break;
    ...
    ...
```

## 4. Add items to IoT Central model (optional)

Every item added to the _GOOGLE_ITEMS_ enum will be send to IoT Central using the item Id as telemetry name.

```ts
enum GOOGLE_ITEMS {
  STEPS = 'steps',
  BLOOD_PRESSURE_SYSTOLIC = 'bloodPressureSystolic',
  BLOOD_PRESSURE_DIASTOLIC = 'bloodPressureDiastolic',
}
```

```json
...
{
  "@id": "dtmi:cpm:GoogleFit_5r4:steps;1",
  "@type": "Telemetry",
  "displayName": {
    "en": "Steps"
  },
  "name": "steps",
  "schema": "double"
},
{
    "@id": "dtmi:cpm:GoogleFit_5r4:BloodPressureSystolic;1",
    "@type": "Telemetry",
    "displayName": {
        "en": "Blood Pressure Systolic"
    },
    "name": "BloodPressureSystolic",
    "schema": "double"
},
{
    "@id": "dtmi:cpm:GoogleFit_5r4:BloodPressureDiastolic;1",
    "@type": "Telemetry",
    "displayName": {
        "en": "Blood Pressure Diastolic"
    },
    "name": "BloodPressureDiastolic",
    "schema": "double"
}
```
