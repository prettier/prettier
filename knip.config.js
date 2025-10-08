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
        "packages/plugin-oxc/index.js",
        "packages/plugin-hermes/index.js",
      ],
      project: ["src/**", "scripts/**"],
      ignore: [
        "scripts/build/config.js",
        "scripts/build/build-javascript-module.js",
        "scripts/tools/**",
        "src/experimental-cli/**",
        "src/universal/*.browser.js",
      ],
      ignoreDependencies: [
        "eslint-formatter-friendly",
        "ts-expect",
        "buffer",
        "deno-path-from-file-url",
      ],
      ignoreBinaries: [
        "test-coverage",
        "renovate-config-validator",
        "pkg-pr-new",
      ],
    },
    website: {
      entry: [
        "playground/**/*.{js,jsx}",
        "src/pages/**/*.{js,jsx}",
        "static/**/*.{js,mjs}",
      ],
      ignoreDependencies: [
        "@docusaurus/faster",
        "@docusaurus/plugin-content-docs",
      ],
    },
    "scripts/tools/bundle-test": {},
    "scripts/tools/eslint-plugin-prettier-internal-rules": {},
    "scripts/release": {
      entry: ["release.js"],
    },
  },
};
