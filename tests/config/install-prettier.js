import path from "node:path";
import fs from "node:fs";
import { execaSync } from "execa";
import tempy from "tempy";
import chalk from "chalk";

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

function installPrettier(packageDir) {
  const tmpDir = tempy.directory();
  directoriesToClean.add(tmpDir);
  const fileName = execaSync("npm", ["pack"], {
    cwd: packageDir,
  }).stdout.trim();
  const file = path.join(packageDir, fileName);
  const packed = path.join(tmpDir, fileName);
  fs.copyFileSync(file, packed);
  fs.unlinkSync(file);

  execaSync(client, ["init", "-y"], { cwd: tmpDir });

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
      `
Prettier installed
  at ${chalk.inverse(installed)}
  from ${chalk.inverse(packageDir)}
  with ${chalk.inverse(client)}.
      `.trim()
    )
  );

  return installed;
}

export default installPrettier;
