"use strict";

const path = require("path");
const shell = require("shelljs");
const tempy = require("tempy");

shell.config.fatal = true;

const rootDir = path.join(__dirname, "..");
const client = (process.env.NPM_CLIENT || "yarn").trim();
const packageDir =
  process.env.NODE_ENV === "production" ? path.join(rootDir, "dist") : rootDir;

module.exports = () => {
  const tmpDir = tempy.directory();
  const file = shell.exec("npm pack", { cwd: packageDir }).stdout.trim();
  shell.mv(path.join(packageDir, file), tmpDir);
  shell.exec("npm init -y", { cwd: tmpDir, silent: true });
  let installCommand = "";
  switch (client) {
    case "npm":
      // npm fails when engine requirement only with `--engine-strict`
      installCommand = `npm install "file:./${file}" --engine-strict`;
      break;
    case "pnpm":
      // Note: current pnpm can't work with `--engine-strict` and engineStrict setting in `.npmrc`
      installCommand = `pnpm add "file:./${file}"`;
      break;
    case "berry":
      shell.exec("yarn set version berry", { cwd: tmpDir });
    // Fall through
    case "yarn":
    default:
      // yarn fails when engine requirement not compatible by default
      installCommand = `yarn add "file:./${file}"`;
  }

  shell.exec(installCommand, { cwd: tmpDir });

  return path.join(tmpDir, "node_modules/prettier");
};
