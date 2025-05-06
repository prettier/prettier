export default {
  workspaces: {
    ".": {
      entry: [
        "src/plugins/*",
        "scripts/**",
        // We use `new Function()` to create `import()` in our `bin` file (bin/prettier.cjs)
        // so there is no actual use of the CLI files
        "src/cli/index.js",
        "src/experimental-cli/index.js",
      ],
      project: ["src/**", "scripts/**"],
      ignore: [
        "scripts/build/config.js",
        "scripts/build/build-javascript-module.js",
        "scripts/tools/**",
        "src/experimental-cli/**",
      ],
      ignoreDependencies: ["eslint-formatter-friendly", "ts-expect"],
      ignoreBinaries: [
        "test-coverage",
        "renovate-config-validator",
        "pkg-pr-new",
      ],
    },
    // TODO: Enable this after we fix https://github.com/prettier/prettier/issues/11409
    website: {
      ignore: ["**/*"],
    },
    "scripts/tools/bundle-test": {},
    "scripts/tools/eslint-plugin-prettier-internal-rules": {},
    "scripts/release": {
      entry: ["release.js"],
    },
  },
};
