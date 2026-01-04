import path from "node:path";
import { DIST_DIR, PACKAGES_DIRECTORY } from "../../utilities/index.js";
import { createJavascriptModuleBuilder } from "../builders/javascript-module.js";
import { createPackageMetaFilesConfig } from "./config-helpers.js";

const packageConfig = {
  packageName: "@prettier/mcp",
  sourceDirectory: path.join(PACKAGES_DIRECTORY, "mcp"),
  distDirectory: path.join(DIST_DIR, "mcp"),
  modules: [],
};

const dependencies = ["prettier", "zod", "@modelcontextprotocol/sdk"];

const mainModule = {
  name: "CLI",
  files: [
    {
      input: "cli.js",
      output: "cli.mjs",
      build: createJavascriptModuleBuilder({
        input: "cli.js",
        output: "cli.mjs",
        format: "esm",
        platform: "node",
        external: dependencies,
        replaceModule: [
          {
            module: path.join(import.meta.dirname, "../../../src/index.js"),
            external: "prettier",
          },
        ],
        // addDefaultExport: true,
      }),
    },
  ],
};

packageConfig.modules.push(
  mainModule,
  createPackageMetaFilesConfig({
    "package.json"(packageJson, { projectPackageJson }) {
      return {
        ...packageJson,
        dependencies: Object.fromEntries(
          dependencies.map((name) => [
            name,
            projectPackageJson.dependencies[name],
          ]),
        ),
      };
    },
  }),
);

export default packageConfig;
