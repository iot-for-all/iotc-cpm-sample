#!/usr/bin/env bash
if [ "$AGENT_JOBSTATUS" == "Succeeded" ]; then
    cd android
    VERSION=`./gradlew -q printVersion | tail -n 1`
    echo $VERSION
    git config user.email "$GIT_EMAIL"
    git config user.name "$GIT_USER"
    git add ./gradle.properties
    git commit -m "Android Release v$VERSION" --author="$GIT_USER <$GIT_EMAIL>"
    git remote set-url --push origin https://$GIT_TOKEN@github.com/$GIT_USER/cpm-poc.git
    git push origin master
    cd ..
fi