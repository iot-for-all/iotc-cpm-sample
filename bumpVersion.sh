#!/usr/bin/env bash
ARGS_LENGTH=$#

while test $ARGS_LENGTH -gt 0; do
    case "$1" in
        -m|--marketing-version)
            shift
            CUSTOM_MARKETING="$1"
            shift
            ;;
        -b|--bundle-version)
            shift
            CUSTOM_BUNDLE="$1"
            shift
            ;;
        *)
            break
            ;;
    esac
done

if [ -z $CUSTOM_BUNDLE ]; then
    BUILD_NAME="$BUILD_BUILDNUMBER"
else
    BUILD_NAME="$CUSTOM_BUNDLE"
fi

echo "Build Name: $BUILD_NAME"
echo "Version Name: $CUSTOM_MARKETING"


if [ "$AGENT_OS" == "Darwin" ] # iOS build
then
# iOS
    cd ios
    CUR_VER_STRING=`agvtool what-marketing-version -terse1`
    IFS='.' read -ra CUR_VER_NUMB <<< "$CUR_VER_STRING"
    echo "Current Marketing Version: ${CUR_VER_NUMB[0]}.${CUR_VER_NUMB[1]}.${CUR_VER_NUMB[2]}"

    agvtool new-version -all $BUILD_NAME
    # if [ "$BUILD_SOURCEBRANCHNAME" == "master" ]; then
    #     if [ -z "$CUSTOM_MARKETING" ]; then
    #         NEW_MINOR=$(( ${CUR_VER_NUMB[2]} + 1 ))
    #         agvtool new-marketing-version "${CUR_VER_NUMB[0]}.${CUR_VER_NUMB[1]}.${NEW_MINOR}"
    #     else
    #         agvtool new-marketing-version "$CUSTOM_MARKETING"
    #     fi
    # fi
fi