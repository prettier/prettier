# Prettier Build Script

## Requirements

- Node.js version `>= 14.18`.

## Usage

```sh
yarn build
```

## Flags

### `--playground`

Run script with `--playground` flag will only build files needed for the website.

```sh
yarn build --playground
```

### `--print-size`

To print the bundled file sizes:

```sh
yarn build --print-size
```

### `--file`

To build a single file:

```sh
yarn build --file=parser-babel.js
```

### `--minify` and `--no-minify`

By default, the file minification is controlled by `config.mjs` and `bundler.mjs`, these flags are added to override that behavior.

These should only be used for debugging purposes, suggest to use them together with the `--file` flag.

Force minify files:

```sh
yarn build --file=index.js --minify
```

Disable minify files:

```sh
yarn build --file=parser-babel.js --no-minify
```

### `--no-babel`

Currently, we need babel to transform/shim following new language features:

- `Array#flat()` for Node.js 10
- `Array#flatMap()` for Node.js 10
- `Object.fromEntries()` for Node.js 10

When debugging the build script, we may want skip this step, so the build process can be faster.

`--babel` have no effect, don't use.

```sh
yarn build --file=index.js --skip-babel
```
