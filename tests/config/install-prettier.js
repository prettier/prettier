import path from "node:path";
import fs from "node:fs";
import { outdent } from "outdent";
import { execaSync } from "execa";
import { temporaryDirectory as getTemporaryDirectory } from "tempy";
import chalk from "chalk";

const allowedClients = new Set(["yarn", "npm", "pnpm"]);

const client = process.env.NPM_CLIENT;
if (!allowedClients.has(client)) {
  throw new Error(`Invalid npm client '${client}`);
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
  const tmpDir = getTemporaryDirectory();
  directoriesToClean.add(tmpDir);
  const fileName = execaSync("npm", ["pack"], {
    cwd: packageDir,
  }).stdout.trim();
  const file = path.join(packageDir, fileName);
  const packed = path.join(tmpDir, fileName);
  fs.copyFileSync(file, packed);
  fs.unlinkSync(file);

  const runNpmClient = (args) => execaSync(client, args, { cwd: tmpDir, stdout:"inherit", stderr:"inherit"  });

  runNpmClient(client === "pnpm" ? ["init"] : ["init", "-y"]);

  switch (client) {
    case "npm":
      runNpmClient(["config", "set", "registry", "http://registry.npmjs.org/"]);
      // npm fails when engine requirement only with `--engine-strict`
      runNpmClient(["install", packed, "--engine-strict", "--loglevel", "verbose"]);
      break;
    case "pnpm":
      // Note: current pnpm can't work with `--engine-strict` and engineStrict setting in `.npmrc`
      runNpmClient(["add", packed, "--engine-strict"]);
      break;
    case "yarn":
      // yarn fails when engine requirement not compatible by default
      runNpmClient(["config", "set", "nodeLinker", "node-modules"]);
      runNpmClient(["add", `prettier@file:${packed}`]);
    // No default
  }

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
}

export default installPrettier;
