#!/usr/bin/env bash
if [ "$AGENT_JOBSTATUS" == "Succeeded" ]; then
    cd android
    VERSION=`./gradlew -q printVersion | tail -n 1`
    echo $VERSION
    git add ./gradle.properties
    git commit -m "Android Release v$VERSION" --author="Luca Druda <lucadruda@gmail.com>"
    git remote set-url --push origin https://$GIT_TOKEN:@github.com/lucadruda/cpm-poc.git
    git push origin master
    cd ..
fi