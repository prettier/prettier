"use strict";

const path = require("path");
const shell = require("shelljs");
const tempy = require("tempy");

// [prettierx] package name & peer dependencies:
const { name, devDependencies } = require("../package.json");

// [prettierx] peer dependency versions:
const flowParserVersion = devDependencies["flow-parser"];
const typescriptVersion = devDependencies.typescript;

shell.config.fatal = true;

const client = process.env.NPM_CLIENT || "yarn";

module.exports = (packageDir) => {
  const tmpDir = tempy.directory();
  const file = shell.exec("npm pack", { cwd: packageDir }).stdout.trim();
  shell.mv(path.join(packageDir, file), tmpDir);
  const tarPath = path.join(tmpDir, file);

  shell.exec(`${client} init -y`, { cwd: tmpDir, silent: true });
  let installCommand = "";
  switch (client) {
    case "npm":
      // [prettierx] peer dependencies via npm:
      shell.exec(`npm i flow-parser@${flowParserVersion}`, { cwd: tmpDir });
      shell.exec(`npm i typescript@${typescriptVersion}`, { cwd: tmpDir });
      // npm fails when engine requirement only with `--engine-strict`
      installCommand = `npm install "${tarPath}" --engine-strict`;
      break;
    case "pnpm":
      // [prettierx] skip peer dependencies via pnpm for now (...)
      // shell.exec(`pnpm add flow-parser@${flowParserVersion}`, { cwd: tmpDir });
      // shell.exec(`pnpm add typescript@${typescriptVersion}`, { cwd: tmpDir });
      // Note: current pnpm can't work with `--engine-strict` and engineStrict setting in `.npmrc`
      installCommand = `pnpm add "${tarPath}"`;
      break;
    default:
      // [prettierx] peer dependencies via Yarn:
      shell.exec(`yarn add flow-parser@${flowParserVersion}`, { cwd: tmpDir });
      shell.exec(`yarn add typescript@${typescriptVersion}`, { cwd: tmpDir });
      // yarn fails when engine requirement not compatible by default
      installCommand = `yarn add "${tarPath}"`;
  }

  shell.exec(installCommand, { cwd: tmpDir });

  // [prettierx] use package name:
  return path.join(tmpDir, "node_modules", name);
};
