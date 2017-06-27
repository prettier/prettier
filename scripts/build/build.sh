#!/bin/bash
set -e
cd "$(dirname "$0")";
cd ../..;

rm -Rf dist/ docs/lib/
mkdir -p docs/lib/

## --- Lib ---

echo 'Bundling lib index...';
node_modules/.bin/rollup -c scripts/build/rollup.index.config.js

echo 'Bundling lib bin...';
node_modules/.bin/rollup -c scripts/build/rollup.bin.config.js
chmod +x ./dist/bin/prettier.js

for parser in babylon flow graphql typescript parse5 json; do
  echo "Bundling lib $parser...";
  node_modules/.bin/rollup -c scripts/build/rollup.parser.config.js --environment parser:$parser
done

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
cp dist/index.js docs/lib/index.js
node_modules/babel-cli/bin/babel.js dist/index.js --out-file docs/lib/index.js --presets=es2015

echo 'Bundling docs babylon...';
node_modules/.bin/rollup -c scripts/build/rollup.docs.config.js --environment filepath:parser-babylon.js
node_modules/babel-cli/bin/babel.js docs/lib/parser-babylon.js --out-file docs/lib/parser-babylon.js --presets=es2015

for parser in flow graphql typescript postcss parse5 json; do
  echo "Bundling docs $parser...";
  node_modules/.bin/rollup -c scripts/build/rollup.docs.config.js --environment filepath:parser-$parser.js
done

echo;

## --- Misc ---

echo 'Remove eval'
perl -pi -e 's/eval\("require"\)/require/g' dist/index.js dist/bin/prettier.js

echo 'Create prettier-version.js'
node -p '`prettierVersion = "${require(".").version}";`' > docs/lib/prettier-version.js

echo 'Copy sw-toolbox.js to docs'
cp node_modules/sw-toolbox/sw-toolbox.js docs/lib/sw-toolbox.js
cp node_modules/sw-toolbox/companion.js  docs/lib/sw-toolbox-companion.js

echo 'Copy package.json'
node -p "pkg = require('./package.json'), delete pkg.dependencies, JSON.stringify(pkg, null, 2)" > dist/package.json

echo 'Copy README.md'
cp README.md dist/README.md

echo 'Done!'
echo;
echo 'How to test against dist:'
echo '  1) yarn test --prod'
echo;
echo 'How to publish:'
echo '  1) IMPORTANT!!! Go to dist/'
echo '  2) npm publish'
