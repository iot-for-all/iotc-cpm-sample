#!/bin/bash

CURRENT_TAG=$(git tag -l --sort=-v:refname | sed -n 2p)
echo "Current Tag: $CURRENT_TAG"

CHANGES=$(git log --pretty=format:"- %s" ...$CURRENT_TAG)

echo -e "**$BUILD_BUILDNUMBER**\n\n$CHANGES" > CHANGELOG.md