import path from "node:path";
import { outdent } from "outdent";
import { DIST_DIR, PACKAGES_DIRECTORY } from "../../utilities/index.js";
import { createJavascriptModuleBuilder } from "../builders/javascript-module.js";
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
        format: "esm",
        platform: "universal",
        addDefaultExport: true,
        replaceModule: [
          {
            module: getPackageFile("oxc-parser/src-js/wasm.js"),
            process(text) {
              text = text.replace(
                'export * from "@oxc-parser/binding-wasm32-wasip1";',
                "",
              );

              text = text.replace(
                'export { default as visitorKeys } from "./generated/visit/keys.js";',
                "",
              );

              return text;
            },
          },
          {
            module: getPackageFile(
              "@oxc-parser/binding-wasm32-wasip1/parser.wasip1-browser.js",
            ),
            process(text) {
              const wasmUrlPattern =
                /const __wasmUrl = new URL\('(?<wasmUrl>.\/[a-z0-9.-]+\.wasm)', import\.meta\.url\)\.href(?=\n)/;
              const { wasmUrl } = text.match(wasmUrlPattern).groups;

              text = text.replace(wasmUrlPattern, "");
              text = text.replace(
                "const __wasmFile = await __wasmResponse.arrayBuffer()",
                outdent`
                  import __wasmFile from ${JSON.stringify(wasmUrl)} with {type: "bytes"};
                `,
              );
              text = text.replace(
                "const __wasmResponse =",
                "const __wasmResponse = {ok: 1} ||",
              );

              text = text.replace("await __rollbackWasiInitialization()", "[]");

              text = text.replace(
                "await instantiateNapiModule(",
                "instantiateNapiModuleSync(",
              );

              text = text.replaceAll(
                /new URL\((?<url>".*?"), import\.meta\.url\)/g,
                "{/* $<url> */}",
              );

              return text;
            },
          },
        ],
        isAllowedWarning: (warning) =>
          (warning.id === "package.json" &&
            warning.location.file ===
              "node_modules/@tybys/wasm-util/package.json") ||
          (warning.id === "indirect-require" &&
            warning.location.file ===
              "node_modules/@emnapi/runtime/dist/emnapi.js"),
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
