#!/bin/bash

RELEASE_VERSION=$1

if [ -z "$RELEASE_VERSION" ]; then
  echo 'Usage: ./release-version.sh RELEASE_VERSION'
  exit 1
fi

yarn run version -- update $RELEASE_VERSION

git add .
git commit -m "Release version $RELEASE_VERSION"
git push && git push --tags
