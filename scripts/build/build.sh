#!/bin/bash
set -e
cd "$(dirname "$0")";
cd ../..;

rm -Rf dist/
rm -f docs/*.js

echo 'The warning about eval being strongly discouraged is normal.'

## --- Lib ---

echo 'Bundling lib index...';
node_modules/.bin/rollup -c scripts/build/rollup.index.config.js

echo 'Bundling lib bin...';
node_modules/.bin/rollup -c scripts/build/rollup.bin.config.js
chmod +x ./dist/bin/prettier.js

echo 'Bundling lib babylon...';
node_modules/.bin/rollup -c scripts/build/rollup.parser.config.js --environment parser:babylon

echo 'Bundling lib flow...';
node_modules/.bin/rollup -c scripts/build/rollup.parser.config.js --environment parser:flow

echo 'Bundling lib typescript...';
node_modules/.bin/rollup -c scripts/build/rollup.parser.config.js --environment parser:typescript

echo 'Bundling lib postcss...';
# PostCSS has dependency cycles and won't work correctly with rollup :(
./node_modules/.bin/webpack src/parser-postcss.js dist/src/parser-postcss.js
# Prepend module.exports =
echo "module.exports =" > dist/src/parser-postcss.js.tmp
cat dist/src/parser-postcss.js >> dist/src/parser-postcss.js.tmp
mv dist/src/parser-postcss.js.tmp dist/src/parser-postcss.js

## --- Docs ---

echo 'Bundling docs index...';
cp dist/index.js docs/index.js

echo 'Bundling docs babylon...';
node_modules/.bin/rollup -c scripts/build/rollup.docs.config.js --environment filepath:src/parser-babylon.js

echo 'Bundling docs flow...';
node_modules/.bin/rollup -c scripts/build/rollup.docs.config.js --environment filepath:src/parser-flow.js

echo 'Bundling docs typescript...';
node_modules/.bin/rollup -c scripts/build/rollup.docs.config.js --environment filepath:src/parser-typescript.js

echo 'Bundling docs postcss...';
node_modules/.bin/rollup -c scripts/build/rollup.docs.config.js --environment filepath:src/parser-postcss.js

## --- Misc ---

echo 'Remove eval'
sed -i '' -e 's/eval("require")/require/g' dist/index.js dist/bin/prettier.js

echo 'Copy package.json'
cp package.json dist/
