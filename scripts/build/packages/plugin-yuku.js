import path from "node:path";
import { DIST_DIR, PACKAGES_DIRECTORY } from "../../utilities/index.js";
import { createJavascriptModuleBuilder } from "../builders/javascript-module.js";
import {
  createPackageMetaFilesConfig,
  createTypesConfig,
} from "./config-helpers.js";

const packageConfig = {
  packageName: "@prettier/plugin-yuku",
  sourceDirectory: path.join(PACKAGES_DIRECTORY, "plugin-yuku"),
  distDirectory: path.join(DIST_DIR, "plugin-yuku"),
  modules: [],
};

const mainModule = {
  name: "Entries",
  files: [
    {
      input: "index.js",
      output: "index.mjs",
      build: createJavascriptModuleBuilder({
        format: "esm",
        platform: "node",
        external: ["yuku-parser"],
        addDefaultExport: true,
      }),
    },
    {
      input: "index.js",
      output: "index.browser.mjs",
      build: createJavascriptModuleBuilder({
        format: "esm",
        platform: "universal",
        addDefaultExport: true,
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
          "yuku-parser": projectPackageJson.dependencies["yuku-parser"],
        },
      };
    },
  }),
);

export default packageConfig;
