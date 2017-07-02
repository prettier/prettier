#!/bin/bash

if [ ! $GITHUB_TOKEN ]; then
  >&2 echo "error: GITHUB_TOKEN not present in env"
  exit 1
fi

git config --global user.email "prettier-bot@users.noreply.github.com"
git config --global user.name "Prettier Bot"
echo "machine github.com login prettier-bot password $GITHUB_TOKEN" > ~/.netrc

cd website
yarn --pure-lockfile && GIT_USER=prettier-bot yarn run publish-gh-pages
