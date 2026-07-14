import path from "node:path";
import { DIST_DIR, PACKAGES_DIRECTORY } from "../../utilities/index.js";
import { createJavascriptModuleBuilder } from "../builders/javascript-module.js";
import { getPackageFile } from "../utilities.js";
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
        input: "index.js",
        output: "index.mjs",
        format: "esm",
        platform: "node",
        addDefaultExport: true,
      }),
    },
    ...createTypesConfig({ input: "index.js", isPlugin: true }),
  ],
};

packageConfig.modules.push(mainModule, createPackageMetaFilesConfig());

export default packageConfig;
