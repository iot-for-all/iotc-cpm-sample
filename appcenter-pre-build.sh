#!/usr/bin/env bash
APP_CENTER_CURRENT_PLATFORM="android"
if [ "$APP_CENTER_CURRENT_PLATFORM" == "android" ]
then
    cd android
    ./gradlew increment
    cd ..
else
    #iOS
    cd ./ios
    pod install  
fi
