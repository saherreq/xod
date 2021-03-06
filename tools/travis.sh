#!/usr/bin/env bash

set -e

upload_dist_to_gcs() {
    tag=$1
    config=$(mktemp)
    echo "$GOOGLE_CLOUD_STORAGE_CONFIG" | base64 --decode >"$config"
    find packages/xod-client-electron/dist -maxdepth 1 -type f \
        -exec node tools/electron-upload.js \
            --config="$config" --file={} --tag="$tag" \;
}

build_dist() {
    # Build again with production settings for the UI part of the IDE
    export NODE_ENV=production
    yarn run build:electron
    yarn run dist:electron
}

tags=$(git tag --points-at "$TRAVIS_COMMIT")
if [ -n "$tags" ]; then
    build_dist
    while read -r tag; do
        node tools/extract-release-notes.js "${tag#v}"  \
            <CHANGELOG.md >packages/xod-client-electron/dist/RELEASE_NOTES.md
        upload_dist_to_gcs $tag
    done <<<"$tags"
fi

if [[ $TRAVIS_BRANCH == prerelease-* ]]; then
    echo 'Building prerelease distributive...'
    lerna publish --skip-git --skip-npm --canary --yes
    tag=$(node -e "console.log('v' + require('./packages/xod-client-electron/package.json').version)")
    build_dist
    upload_dist_to_gcs $tag
fi
