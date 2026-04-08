import fs from "node:fs";
import path from "node:path";
import { PROJECT_ROOT } from "../../utilities/index.js";
import { copyFileBuilder } from "../builders/copy-file.js";
import { createDependenciesLicenseBuilder } from "../builders/dependencies-license.js";
import { createJavascriptModuleBuilder } from "../builders/javascript-module.js";
import { createPackageJsonBuilder } from "../builders/package-json.js";
import { createTypesBuilder } from "../builders/types.js";

const extensions = {
  esm: ".mjs",
  umd: ".js",
  cjs: ".cjs",
};

function createPackageJsonConfig({ "package.json": process }) {
  return {
    input: "package.json",
    output: "package.json",
    build: createPackageJsonBuilder({ process }),
  };
}

function createReadmeConfig() {
  return {
    input: "README.md",
    output: "README.md",
    build: copyFileBuilder,
  };
}

function createLicenseConfig() {
  return {
    input: path.join(PROJECT_ROOT, "LICENSE"),
    output: "LICENSE",
    build: copyFileBuilder,
  };
}

function createThirdPartyNoticeConfig({ packageDisplayName }) {
  return {
    output: "THIRD-PARTY-NOTICES.md",
    build: createDependenciesLicenseBuilder({ packageDisplayName }),
  };
}

function createPackageMetaFilesConfig(options = {}) {
  return {
    name: "Meta files",
    files: [
      createPackageJsonConfig,
      createLicenseConfig,
      createReadmeConfig,
      createThirdPartyNoticeConfig,
    ].map((create) => create(options)),
  };
}

function createTypesConfig({ input, outputBaseName, isPlugin }) {
  const inputBasename = input.slice(0, -path.extname(input).length);
  if (!isPlugin) {
    input = `${inputBasename}.d.ts`;

    if (!fs.existsSync(path.join(PROJECT_ROOT, input))) {
      return [];
    }
  }

  return [
    {
      input,
      output: `${outputBaseName ?? inputBasename}.d.ts`,
      build: createTypesBuilder({ isPlugin }),
    },
  ];
}

function createNodejsFileConfig(file) {
  if (typeof file === "string") {
    file = { input: file };
  }
  let { input, output, outputBaseName, ...buildOptions } = file;

  const format = input.endsWith(".cjs") ? "cjs" : "esm";
  outputBaseName ??= path.basename(input, path.extname(input));

  return [
    {
      input,
      output: `${outputBaseName}${extensions[format]}`,
      build: createJavascriptModuleBuilder({
        format,
        ...buildOptions,
        platform: "node",
      }),
    },
    ...createTypesConfig({ input, outputBaseName }),
  ];
}

function createUniversalFileConfig(file) {
  if (typeof file === "string") {
    file = { input: file };
  }
  let { input, outputBaseName, umdVariableName, ...buildOptions } = file;
  outputBaseName ??= path.basename(input, path.extname(input));
  umdVariableName ??= outputBaseName;

  return [
    ...[
      {
        format: "esm",
        file: `${outputBaseName}${extensions.esm}`,
      },
      {
        format: "umd",
        file: `${outputBaseName}${extensions.umd}`,
        umdVariableName,
      },
    ].map((output) => ({
      input,
      output: output.file,
      build: createJavascriptModuleBuilder({
        platform: "universal",
        addDefaultExport: output.format === "esm",
        format: output.format,
        umdVariableName: output.umdVariableName,
        ...buildOptions,
      }),
    })),
    ...createTypesConfig({ input, outputBaseName }),
  ];
}

export {
  createNodejsFileConfig,
  createPackageMetaFilesConfig,
  createTypesConfig,
  createUniversalFileConfig,
};
