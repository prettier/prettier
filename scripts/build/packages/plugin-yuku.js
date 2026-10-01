import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import yukuParserWasmPackageJson from "@yuku-parser/wasm/package.json" with { type: "json" };
import { outdent } from "outdent";
import yukuParserPackageJson from "yuku-parser/package.json" with { type: "json" };
import { DIST_DIR, PACKAGES_DIRECTORY } from "../../utilities/index.js";
import { createJavascriptModuleBuilder } from "../builders/javascript-module.js";
import { getPackageFile } from "../utilities.js";
import {
  createPackageMetaFilesConfig,
  createTypesConfig,
} from "./config-helpers.js";

assert.equal(yukuParserPackageJson.version, yukuParserWasmPackageJson.version);

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
            async process(text, file) {
              const wasmUrlPattern =
                /const wasmUrl = new URL\("(?<wasmUrl>.\/[a-z0-9.-]+\.wasm)", import\.meta\.url\);/;
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

              text = text.replace('import("node:fs/promises")', "whatever");
              text = text.replace(wasmUrlPattern, "");
              text = text.replace(
                "(await instantiate())",
                outdent`
                  new WebAssembly.Instance(
                    new WebAssembly.Module(
                      __base64ToArrayBuffer(
                        /* "${wasmUrl}" */ ${JSON.stringify(wasmBase64String)}
                      )
                    )
                  )
                `,
              );

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
