#!/bin/bash

xcodebuild -scheme cpm -workspace ios/cpm.xcworkspace -destination generic/platform=iOS build

xcodebuild -workspace ios/cpm.xcworkspace -scheme cpm -sdk iphoneos -configuration Enterprise archive -archivePath $PWD/ios/build/cpm.xcarchive