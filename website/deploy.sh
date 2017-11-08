#!/bin/bash

if [ "$NODE_ENV" = production ]; then
  echo "info: skipping deploy in production builds"
  exit 0
fi

if [ ! "$GITHUB_TOKEN" ]; then
  >&2 echo "error: GITHUB_TOKEN not present in env"
  exit 1
fi

git config --global user.email "prettier-bot@users.noreply.github.com"
git config --global user.name "Prettier Bot"
echo "machine github.com login prettier-bot password $GITHUB_TOKEN" > ~/.netrc

cd website
export GIT_USER=prettier-bot
export CIRCLE_BRANCH=$TRAVIS_BRANCH
export CIRCLE_PROJECT_USERNAME=prettier
export CIRCLE_PROJECT_REPONAME=prettier
export CI_PULL_REQUEST=$TRAVIS_PULL_REQUEST_BRANCH
yarn --pure-lockfile && yarn run publish-gh-pages
