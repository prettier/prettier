"use strict";

const path = require("path");
const fs = require("fs");
const { outdent } = require("outdent");
const { default: chalk } = require("../../vendors/chalk.js");
const { default: tempy } = require("../../vendors/tempy.js");
const { execaSync } = require("../../vendors/execa.js");

const allowedClients = new Set(["yarn", "npm", "pnpm"]);

let client = process.env.NPM_CLIENT;
if (!allowedClients.has(client)) {
  client = "yarn";
}

const directoriesToClean = new Set();

process.on("exit", cleanUp);

function cleanUp() {
  if (directoriesToClean.size === 0) {
    return;
  }
  console.log(chalk.green("Removing installed Prettier:"));

  for (const directory of directoriesToClean) {
    // Node.js<14 don't support `fs.rmSync`
    try {
      fs.rmSync(directory, { force: true, recursive: true });
    } catch {
      // No op
    }

    if (fs.existsSync(directory)) {
      console.error(chalk.red(` - ${chalk.inverse(directory)} FAIL`));
    } else {
      console.log(chalk.green(` - ${chalk.inverse(directory)} DONE`));
    }
  }
}

module.exports = (packageDir) => {
  const tmpDir = tempy.directory();
  directoriesToClean.add(tmpDir);
  const fileName = execaSync("npm", ["pack"], {
    cwd: packageDir,
  }).stdout.trim();
  const file = path.join(packageDir, fileName);
  const packed = path.join(tmpDir, fileName);
  fs.copyFileSync(file, packed);
  fs.unlinkSync(file);

  if (client === "pnpm") {
    execaSync(client, ["init"], { cwd: tmpDir });
  } else {
    execaSync(client, ["init", "-y"], { cwd: tmpDir });
  }

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

  execaSync(client, installArguments, { cwd: tmpDir });
  fs.unlinkSync(packed);

  const installed = path.join(tmpDir, "node_modules/prettier");

  console.log(
    chalk.green(
      outdent`
        Prettier installed
          at ${chalk.inverse(installed)}
          from ${chalk.inverse(packageDir)}
          with ${chalk.inverse(client)}.
      `
    )
  );

  return installed;
};
