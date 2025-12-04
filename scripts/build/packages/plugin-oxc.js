import path from "node:path";
import { DIST_DIR, PACKAGES_DIRECTORY } from "../../utilities/index.js";
import { createJavascriptModuleBuilder } from "../builders/javascript-module.js";
import buildOxcWasmParser from "../hacks/build-oxc-wasm-parser.js";
import { getPackageFile } from "../utilities.js";
import {
  createPackageMetaFilesConfig,
  createTypesConfig,
} from "./config-helpers.js";

const packageConfig = {
  packageName: "@prettier/plugin-oxc",
  sourceDirectory: path.join(PACKAGES_DIRECTORY, "plugin-oxc"),
  distDirectory: path.join(DIST_DIR, "plugin-oxc"),
  modules: [],
};

const mainModule = {
  name: "Entries",
  files: [
    {
      input: "index.js",
      output: "index.mjs",
      prepare: buildOxcWasmParser,
      build: createJavascriptModuleBuilder({
        input: "index.js",
        output: "index.mjs",
        format: "esm",
        platform: "node",
        external: ["oxc-parser"],
        addDefaultExport: true,
      }),
    },
    {
      input: "index.js",
      output: "index.browser.mjs",
      build: createJavascriptModuleBuilder(async () => {
        const { entry } = await buildOxcWasmParser();
        return {
          format: "esm",
          platform: "universal",
          addDefaultExport: true,
          replaceModule: [
            {
              module: getPackageFile("oxc-parser/src-js/wasm.js"),
              path: entry,
            },
          ],
          allowedWarnings: ["indirect-require", "package.json"],
        };
      }),
      playground: true,
    },
    ...createTypesConfig({ input: "index.js", isPlugin: true }),
  ],
};

packageConfig.modules.push(
  mainModule,
  createPackageMetaFilesConfig({
    "package.json"(packageJson, { projectPackageJson }) {
      return {
        ...packageJson,
        dependencies: {
          "oxc-parser": projectPackageJson.dependencies["oxc-parser"],
        },
      };
    },
  }),
);

export default packageConfig;
