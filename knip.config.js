import { isCI } from "ci-info";

/** @import {KnipConfig} from "knip" */

/** @type {KnipConfig} */
const config = {
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
        "scripts/build/packages/*",
        "scripts/build/builders/javascript-module.js",
        "scripts/tools/**",
        "src/experimental-cli/**",
        "src/universal/*.browser.js",
      ],
      ignoreDependencies: [
        "ts-expect",
        "buffer",
        "deno-path-from-file-url",
        "base64-arraybuffer-es6",
      ],
      ignoreBinaries: ["test-coverage"],
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

// Only check workspaces on CI, since they require extra install steps, see https://github.com/prettier/prettier/issues/16913
if (!isCI) {
  config.workspaces = Object.fromEntries(
    Object.entries(config.workspaces).map(([workspace, settings]) => [
      workspace,
      workspace === "." ? settings : { ignore: ["**/*"] },
    ]),
  );
}

export default config;
