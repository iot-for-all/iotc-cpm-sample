#!/usr/bin/env bash
if [ "$APPCENTER_BRANCH" != "master" ]; then
    echo "Not on master. Exiting..."
    exit 1
fi

if [ "$AGENT_JOBSTATUS" == "Succeeded" ]; then
    cd android
    ./gradlew -q increment
    VERSION=`./gradlew -q printVersion | tail -n 1`
    echo $VERSION
    git add ./gradle.properties
    git commit -m "Android Release v$VERSION" --author="Luca Druda <lucadruda@gmail.com>"
    git remote set-url --push origin https://$GIT_TOKEN:@github.com/lucadruda/cpm-poc.git
    git push origin master
    cd ..
fi