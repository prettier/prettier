# Release script

## Usage

```sh
node ./scripts/release/release.js --version NEW_VERSION
```

The script has its own `package.json` so we can reinstall the root's `node_modules/` while making the release.

## Flags

- `--manual` Manual run release process instead of publish from GitHub actions
- `--dry` Dry run
- `--skip-dependencies-install` Skip dependencies installation

## Credits

This script was inspired by [React's release script](https://github.com/facebook/react/tree/001f9ef/scripts/release).
