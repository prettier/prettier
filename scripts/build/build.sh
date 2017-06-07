#!/bin/bash
set -e
cd "$(dirname "$0")";
cd ../..;

rm -Rf dist/
rm -f docs/*.js

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

echo 'Bundling lib graphql...';
node_modules/.bin/rollup -c scripts/build/rollup.parser.config.js --environment parser:graphql

echo 'Bundling lib typescript...';
node_modules/.bin/rollup -c scripts/build/rollup.parser.config.js --environment parser:typescript

echo 'Bundling lib postcss...';
# PostCSS has dependency cycles and won't work correctly with rollup :(
./node_modules/.bin/webpack --hide-modules src/parser-postcss.js dist/parser-postcss.js
# Prepend module.exports =
echo "module.exports =" > dist/parser-postcss.js.tmp
cat dist/parser-postcss.js >> dist/parser-postcss.js.tmp
mv dist/parser-postcss.js.tmp dist/parser-postcss.js

echo;

## --- Docs ---

echo 'Bundling docs index...';
cp dist/index.js docs/index.js
node_modules/babel-cli/bin/babel.js dist/index.js --out-file docs/index.js --presets=es2015

echo 'Bundling docs babylon...';
node_modules/.bin/rollup -c scripts/build/rollup.docs.config.js --environment filepath:parser-babylon.js
node_modules/babel-cli/bin/babel.js docs/parser-babylon.js --out-file docs/parser-babylon.js --presets=es2015

echo 'Bundling docs flow...';
node_modules/.bin/rollup -c scripts/build/rollup.docs.config.js --environment filepath:parser-flow.js

echo 'Bundling docs graphql...';
node_modules/.bin/rollup -c scripts/build/rollup.docs.config.js --environment filepath:parser-graphql.js

echo 'Bundling docs typescript...';
node_modules/.bin/rollup -c scripts/build/rollup.docs.config.js --environment filepath:parser-typescript.js

echo 'Bundling docs postcss...';
node_modules/.bin/rollup -c scripts/build/rollup.docs.config.js --environment filepath:parser-postcss.js

echo;

## --- Misc ---

echo 'Remove eval'
sed -i '' -e 's/eval("require")/require/g' dist/index.js dist/bin/prettier.js

echo 'Copy package.json'
cp package.json dist/

echo 'Done!'
echo;
echo 'How to test against dist:'
echo '  1) Open tests_config/run_spec.js'
echo '  2) add `dist/` to the require'
echo '  3) yarn test'
echo "  4) Don't forget to revert tests_config/run_spec.js"
echo;
echo 'How to publish:'
echo '  1) IMPORTANT!!! Go to dist/'
echo '  2) npm publish'
