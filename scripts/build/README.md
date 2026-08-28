# Prettier Build Script

## Requirements

- Node.js version `>= 22` (see the repository's `package.json`).

## Usage

```sh
yarn build
```

## Flags

### `--package`

What package to build, will build all packages if omitted.

```
yarn build
yarn build --package prettier
yarn build --package prettier --package @prettier/plugin-oxc
```

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

To build specific file(s), use paths relative to `dist/`, including the package
directory. Unknown output paths are rejected:

```sh
yarn build --file=prettier/plugins/babel.mjs
```

```sh
yarn build --file=prettier/standalone.js --file=prettier/plugins/meriyah.js
```

### `--save-as`

To save a JavaScript bundle to a different location, use this flag with exactly
one `--file` flag. The destination must be a relative file path inside that
package's output directory. Relative imports to other bundled files are adjusted
when moving a bundle into a nested directory:

```sh
yarn build --file=prettier/plugins/babel.js --save-as=babel-for-test.js
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

By default, file minification is controlled by the package build configuration.
These flags override that behavior.

These should only be used for debugging purposes, suggest to use them together with the `--file` flag.

Force minify files:

```sh
yarn build --file=prettier/index.mjs --minify
```

Disable minify files:

```sh
yarn build --file=prettier/plugins/babel.js --no-minify
```
