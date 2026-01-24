import path from "node:path";
import { DIST_DIR, PACKAGES_DIRECTORY } from "../../utilities/index.js";
import { createJavascriptModuleBuilder } from "../builders/javascript-module.js";
import { getPackageFile } from "../utilities.js";
import {
  createPackageMetaFilesConfig,
  createTypesConfig,
} from "./config-helpers.js";

const packageConfig = {
  packageName: "@prettier/plugin-hermes",
  sourceDirectory: path.join(PACKAGES_DIRECTORY, "plugin-hermes"),
  distDirectory: path.join(DIST_DIR, "plugin-hermes"),
  modules: [],
};

const mainModule = {
  name: "Entries",
  files: [
    {
      input: "index.js",
      output: "index.mjs",
      build: createJavascriptModuleBuilder({
        platform: "universal",
        addDefaultExport: true,
        replaceModule: [
          {
            module: getPackageFile("hermes-parser/dist/HermesParser.js"),
            process(text) {
              text =
                'const Buffer = globalThis.Buffer ?? require("buffer/").Buffer;' +
                text;
              return text;
            },
          },
          {
            module: getPackageFile("hermes-parser/dist/HermesParserWASM.js"),
            process(text) {
              text = text.replaceAll("process.argv", "[]");
              text = text.replaceAll('require("fs")', "undefined");
              text = text.replaceAll('require("path")', "undefined");
              text =
                'const Buffer = globalThis.Buffer ?? require("buffer/").Buffer;' +
                text;

              return text;
            },
          },
        ],
        format: "esm",
      }),
      playground: true,
    },

    ...createTypesConfig({ input: "index.js", isPlugin: true }),
  ],
};

packageConfig.modules.push(mainModule, createPackageMetaFilesConfig());

export default packageConfig;
