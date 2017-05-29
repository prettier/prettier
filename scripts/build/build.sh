#!/bin/bash
set -e
cd "$(dirname "$0")";
cd ../..;

rm -Rf dist/

echo 'The warning about eval being strongly discouraged is normal.'

echo 'Bundling index...';
node_modules/.bin/rollup -c scripts/build/rollup.index.config.js

echo 'Bundling bin...';
node_modules/.bin/rollup -c scripts/build/rollup.bin.config.js
chmod +x ./dist/bin/prettier.js

echo 'Bundling babylon...';
node_modules/.bin/rollup -c scripts/build/rollup.parser.config.js --environment parser:babylon

echo 'Bundling flow...';
node_modules/.bin/rollup -c scripts/build/rollup.parser.config.js --environment parser:flow

echo 'Bundling typescript...';
node_modules/.bin/rollup -c scripts/build/rollup.parser.config.js --environment parser:typescript

echo 'Bundling postcss...';
node_modules/.bin/rollup -c scripts/build/rollup.parser.config.js --environment parser:postcss
