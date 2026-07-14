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
        replaceModule: [
          {
            module: getPackageFile("yuku-parser"),
            path: getPackageFile("@yuku-parser/wasm"),
          },
          {
            module: getPackageFile("@yuku-parser/wasm"),
            async process(text) {
              const wasmUrlPattern =
                /const wasmUrl = new URL\("(?<wasmFile>.\/.+\.wasm)", import\.meta\.url\);/;
              let { wasmFile } = text.match(wasmUrlPattern).groups;
              const wasmBase64String = await fs.readFile(
                getPackageFile(`@yuku-parser/wasm/${wasmFile}`),
                "base64",
              );

              text = text.replace('import("node:fs/promises")', "whatever");
              text = text.replace(wasmUrlPattern, "");

              text = text.replace(
                "const { memory, alloc, free, parse: wasmParse } = (await instantiate()).exports;",
                outdent`
                  const module = new WebAssembly.Module((wasmBinary));
                  const instance = new WebAssembly.Instance(module);
                  const { memory, alloc, free, parse: wasmParse } = instance.exports;
                `,
              );

              text = outdent`
                import { decode as __decode } from "base64-arraybuffer-es6";
                const __base64ToArrayBuffer = Uint8Array.fromBase64
                  ? (string) => Uint8Array.fromBase64(string).buffer
                  : __decode;
                const wasmBinary = /* "${wasmFile}" */ __base64ToArrayBuffer(${JSON.stringify(wasmBase64String)});

                ${text}
              `;

              return text;
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
          "yuku-parser": projectPackageJson.dependencies["yuku-parser"],
        },
      };
    },
  }),
);

export default packageConfig;
