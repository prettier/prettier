# Prettier Build Script

## Usage

```sh
yarn build
```

## Flags

### `--no-cache` flag

Run script with `--no-cache` flag will clean up the cache directory (`.cache` in project root) before bundling files.

```sh
yarn build --no-cache
```

### `--playground` flag

Run script with `--playground` flag will only build files needed for the website.

```sh
yarn build --playground
```

### `--print-size` flag

To print the bundled file sizes:

```sh
yarn build --print-size
```

### `--minify` and `--no-minify` flags

By default, the file minification is controlled by `config.mjs` and `bundler.mjs`, these flags are added to override the behavior.

This should only used for debugging purposes, it should be used together with the `--file` flag.

Force minify files:

```sh
yarn build --minify
```

Disable minify files:

```sh
yarn build --no-minify
```

### `--file` flag

To build a single file:

```sh
yarn build --file=parser-babel.js
```
