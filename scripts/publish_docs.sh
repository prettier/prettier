#!/usr/bin/env bash

# Runs a doc build and commits the results

# includes [ci skip] in commit message to avoid an endless loop of builds

# checking the build/job numbers allows it to only publish once even though we test against multiple node.js versions
# The ".1" job is the first on the list in .travis.yml. By convention, this is the oldest supported node.js version.


#config
# get a token from https://github.com/settings/tokens with the `public_repo` scope and encrypt it like so:
# travis encrypt --add -r user-org-name/repo-name 'GH_TOKEN=xxxxxxxxxxxxxxxxxxx'
# then set the below vars and make sure travis runs this script in the "after_success" section
export SLUG="jlongster/prettier"
export BRANCH="master"


if [ "$TRAVIS_REPO_SLUG" == "$SLUG" ] \
  && [ "$TRAVIS_PULL_REQUEST" == "false" ] \
  && [ "$TRAVIS_BRANCH" == "$BRANCH" ] \
  && [ "$TRAVIS_BUILD_NUMBER.1" == "$TRAVIS_JOB_NUMBER" ] \
  ; then

  echo "Generating docs"

  git config --global push.default simple
  git config --global user.email "travis@travis-ci.org"
  git config --global user.name "travis-ci"
  git config remote.origin.url https://${GH_TOKEN}@github.com/${SLUG}
  # checkout the branch that the commit is actually on instead of "detached head" state
  git checkout $BRANCH

  npm run build:docs || { echo "\nDocs build failed.\n" ; exit 1; }

  git add -A docs/
  git commit -m "Generating docs after commit $TRAVIS_COMMIT [ci skip]"
  # push with -q to prevent the GH_TOKEN from leaking
  git push -q  || { echo "\nPush failed\n" ; exit 1; }

else

  echo -e "Not generating docs for build $TRAVIS_JOB_NUMBER on branch $TRAVIS_BRANCH of repo $TRAVIS_REPO_SLUG"

fi
