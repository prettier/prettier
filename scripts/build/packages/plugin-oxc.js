import fs from "node:fs/promises";
import path from "node:path";
import { outdent } from "outdent";
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
      build: createJavascriptModuleBuilder({
        input: "index.js",
        platform: "universal",
        addDefaultExport: true,
        format: "esm",
        replaceModule: [
          {
            module: getPackageFile(
              "@oxc-parser/binding-wasm32-wasip1/parser.wasip1-browser.js",
            ),
            async process(text, file) {
              const wasmUrlPattern =
                /const __wasmUrl = new URL\('(?<wasmUrl>.\/[a-z0-9.-]+\.wasm)', import\.meta\.url\)\.href(?=\n)/;
              const { wasmUrl } = text.match(wasmUrlPattern).groups;
              const wasmFile = path.join(path.dirname(file), wasmUrl);
              const wasmBase64String = await fs.readFile(wasmFile, "base64");

              text = text.replace(
                "const __wasmResponse = await globalThis.fetch(__wasmUrl)",
                "const __wasmResponse = {ok: true}",
              );

              text = text.replace(
                "await __wasmResponse.arrayBuffer()",
                outdent`
                  __base64ToArrayBuffer(
                    /* "${wasmUrl}" */ ${JSON.stringify(wasmBase64String)}
                  )
                `,
              );

              text = text.replace("await __rollbackWasiInitialization()", "[]");

              text = text.replace(
                "await instantiateNapiModule(",
                "instantiateNapiModuleSync(",
              );

              return text;
            },
          },
          {
            module: getPackageFile("@emnapi/runtime/dist/emnapi.js"),
            process(text) {
              return "var require;\n\n" + text;
            },
          },
        ],
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
