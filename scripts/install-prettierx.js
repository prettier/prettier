"use strict";

const path = require("path");
const shell = require("shelljs");
const tempy = require("tempy");

// [prettierx]: optional dep support & fork package name from package.json
const {
  devDependencies,
  peerDependenciesMeta,
  name,
} = require("../package.json");

shell.config.fatal = true;

const client = process.env.NPM_CLIENT || "yarn";

module.exports = (packageDir) => {
  const tmpDir = tempy.directory();
  const file = shell.exec("npm pack", { cwd: packageDir }).stdout.trim();
  shell.mv(path.join(packageDir, file), tmpDir);
  const tarPath = path.join(tmpDir, file);

  shell.exec(`${client} init -y`, { cwd: tmpDir, silent: true });

  // [prettierx]: typescript/flow-parser optional dep support
  const args = [
    `"${tarPath}"`,
    ...Object.entries(peerDependenciesMeta)
      .filter(([, meta]) => meta.optional)
      .map(([dep]) => `${dep}@${devDependencies[dep]}`),
  ].join(" ");

  let installCommand = "";
  switch (client) {
    case "npm":
      // npm fails when engine requirement only with `--engine-strict`
      installCommand = `npm install ${args} --engine-strict`;
      break;
    case "pnpm":
      // Note: current pnpm can't work with `--engine-strict` and engineStrict setting in `.npmrc`
      installCommand = `pnpm add ${args}`;
      break;
    default:
      // yarn fails when engine requirement not compatible by default
      installCommand = `yarn add ${args}`;
  }

  shell.exec(installCommand, { cwd: tmpDir });

  // [prettierx] use fork package name:
  return path.join(tmpDir, "node_modules", name);
};
