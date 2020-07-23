# Walkthrough

## 1. Login
<img src='../media/login.png' width=250/>

Insert username and password. Login is simulated so credentials are not validated, you can enter anything.

If you want to connect to Azure IoT Central you must note down inserted password as it will be needed when generating authorization codes using the credentials portal.

## 2. Authorization
<img src='../media/authorization.png' width=150/>
<img src='../media/qrcode.png' width=150/>
<img src='../media/numeric.png' width=150/>

Select one of the options to connect with Azure IoT Central.
QR or numeric codes can be obtained through credentials portal.

To avoid connecting with Azure IoT Central click on "Use Simulated Code". The application will still read data from BLE devices and show it on insight chart but it will not generate telemetry data for IoT Central.

## 3. Home
<img src='../media/home.png' width=250/>

Select one of the options.
- __Pair device__: allows to connect to a real or simulated BLE device.
- __Sync with platform__: allows to read data from health platforms (Apple Health when running on iOS, Google Fit when on Android).

## 4. Scan devices
<img src='../media/scan.png' width=150/>
<img src='../media/scan_simulated.png' width=150/>
<img src='../media/simulated_result.png' width=150/>

Scans for nearby devices. By selecting "Use simulated device" you can skip connecting a real device and use one of the simulated ones which generates sample data every 5 seconds. Simulated devices are mapped to models in the CPM application template (see [docs](https://docs.microsoft.com/en-us/azure/iot-central/healthcare/tutorial-continuous-patient-monitoring)).

## 5. Insight
<img src='../media/insight.jpeg' width=250/>

Data from BLE device or platforms are shown in the chart. Legend is at bottom.
Detail message is hardcoded. The developer can change that text accordingly to read data.

More details at [Insight.](./insight.md)