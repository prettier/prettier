"use strict";

const path = require("path");
const fs = require("fs");
const execa = require("execa");
const tempy = require("tempy");

const client = process.env.NPM_CLIENT || "yarn";

module.exports = (packageDir) => {
  const tmpDir = tempy.directory();
  const fileName = execa
    .sync("npm", ["pack"], { cwd: packageDir })
    .stdout.trim();
  const file = path.join(packageDir, fileName);
  const packed = path.join(tmpDir, fileName);
  fs.copyFileSync(file, packed);
  fs.unlinkSync(file);

  execa.sync(client, ["init", "-y"], { cwd: tmpDir });

  let installArguments = [];
  switch (client) {
    case "npm":
      // npm fails when engine requirement only with `--engine-strict`
      installArguments = ["install", packed, "--engine-strict"];
      break;
    case "pnpm":
      // Note: current pnpm can't work with `--engine-strict` and engineStrict setting in `.npmrc`
      installArguments = ["add", packed, "--engine-strict"];
      break;
    default:
      // yarn fails when engine requirement not compatible by default
      installArguments = ["add", packed];
  }

  execa.sync(client, installArguments, { cwd: tmpDir });
  fs.unlinkSync(packed);

  return path.join(tmpDir, "node_modules/prettier");
};
