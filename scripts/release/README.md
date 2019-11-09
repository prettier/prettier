# Release script

## Usage

```sh
# set environment variable GITHUB_API_TOKEN if it's a patch release
# since we need to get merged PRs from GitHub to generate changelog
node ./scripts/release/release.js --version NEW_VERSION
```

The script its own `package.json` so we can reinstall the root's `node_modules/` while making the release.

## Credits

This script was inspired by [React's release script](https://github.com/facebook/react/tree/001f9ef/scripts/release).
