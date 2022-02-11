"use strict";

const path = require("path");
const fs = require("fs");
const execa = require("execa");
const tempy = require("tempy");
const chalk = require("chalk");

const allowedClients = new Set(["yarn", "npm", "pnpm"]);

let client = process.env.NPM_CLIENT;
if (!allowedClients.has(client)) {
  client = "yarn";
}

const highlight = (text) => chalk.bgGreen(chalk.white(text));
const directoriesToClean = new Set();

process.on("exit", cleanUp);

function cleanUp() {
  for (const directory of directoriesToClean) {
    fs.rmSync(directory, { force: true, recursive: true });
    if (fs.existsSync(directory)) {
      console.log(chalk.red(`Failed to remove '${highlight(directory)}'.`));
    } else {
      console.log(chalk.yellow(`'${highlight(directory)}' removed.`));
    }
  }
}

module.exports = (packageDir) => {
  console.log(
    chalk.yellow(
      `Installing Prettier from '${highlight(packageDir)}' with '${client}'.`
    )
  );

  const tmpDir = tempy.directory();
  directoriesToClean.add(tmpDir);
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

  const installed = path.join(tmpDir, "node_modules/prettier");

  console.log(chalk.green(`Prettier installed at '${highlight(installed)}'.`));

  return installed;
};
