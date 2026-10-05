import fs from "node:fs/promises";
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
            async process(text, file) {
              const wasmUrlPattern =
                /const __wasmUrl = new URL\('(?<wasmUrl>.\/[a-z0-9.-]+\.wasm)', import\.meta\.url\)\.href(?=\n)/;
              const { wasmUrl } = text.match(wasmUrlPattern).groups;
              const wasmFile = path.join(path.dirname(file), wasmUrl);
              const wasmBase64String = await fs.readFile(wasmFile, "base64");

              text = outdent`
                import { decode as __decode } from "base64-arraybuffer-es6";

                const __base64ToArrayBuffer = Uint8Array.fromBase64
                  ? (string) => Uint8Array.fromBase64(string).buffer
                  : __decode;

                ${text}
              `;

              text = text.replace(wasmUrlPattern, "");
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
