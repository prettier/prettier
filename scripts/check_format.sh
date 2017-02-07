#!/usr/bin/env bash

# Tests to see if the source is already up to prettier's standards, fails if it isn't

# stash the existing changes, if any (yarn.lock may have changes in some cases)
git stash

# then run a format
npm run format:all

echo ""

# finally, check to see if anything changed
if [[ $(git diff  index.js src/*.js bin/*.js) ]]; then
    echo "Source files are not properly formatted:"
    git diff
    exit 1
else
    echo "Source files are properly formatted"
fi

