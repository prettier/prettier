# Prettier Build Script

## Requirements

- Node.js version `>= 16.16`.

## Usage

```sh
yarn build
```

## Flags

### `--clean`

Remove `dist` directory before bundle files.

```sh
yarn build --clean
```

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

### `--compare-size`

Print the file size changes compare to the last released version:

```sh
yarn build --compare-size
```

### `--file`

To build specific file(s):

```sh
yarn build --file=esm/parser-babel.mjs
```

```sh
yarn build --file=standalone.js --file=parser-meriyah.js
```

### `--save-as`

To save bundled file to a different location, this flag can only use together with ONE `--file` flag

```sh
yarn build --file=parser-babel.js --save-as=babel-for-test.js
```

### `--report`

Visualize and analyze your esbuild bundle to see which modules are taking up space.

Available reporter formats:

- `html` Generate a HTML report file, saved next to the bundled file with `.report.html` suffix.
- `text` Generate a plain text report file, saved next to the bundled file with `.report.txt` suffix.
- `stdout` Log report information in console.

```sh
yarn build --report=all
yarn build --report=stdout --report=text --report=html
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
