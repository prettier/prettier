"use strict";

const path = require("path");
const fs = require("fs");
const execa = require("execa");
const tempy = require("tempy");

const client = process.env.NPM_CLIENT || "yarn";

module.exports = (packageDir) => {
  const tmpDir = tempy.directory();
  let file = execa.sync("npm", ["pack"], { cwd: packageDir }).stdout.trim();
  file = path.join(packageDir, file);
  const tarPath = path.join(tmpDir, file);
  fs.copyFileSync(file, tarPath);
  fs.unlinkSync(file);

  execa.sync(client, ["init", "-y"], { cwd: tmpDir });

  let installArguments = [];
  switch (client) {
    case "npm":
      // npm fails when engine requirement only with `--engine-strict`
      installArguments = ["install", tarPath, "--engine-strict"];
      break;
    case "pnpm":
      // Note: current pnpm can't work with `--engine-strict` and engineStrict setting in `.npmrc`
      installArguments = ["add", tarPath, "--engine-strict"];
      break;
    default:
      // yarn fails when engine requirement not compatible by default
      installArguments = ["add", tarPath];
  }

  execa.sync(client, installArguments, { cwd: tmpDir });

  return path.join(tmpDir, "node_modules/prettier");
};
