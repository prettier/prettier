import fs from "node:fs";
import path from "node:path";
import chalk from "chalk";
import { execaSync } from "execa";
import { outdent } from "outdent";
import { temporaryDirectory as createTemporaryDirectory } from "tempy";

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

function installPrettier(packageDirectory) {
  const temporaryDirectory = createTemporaryDirectory();
  directoriesToClean.add(temporaryDirectory);
  const fileName = execaSync("npm", ["pack"], {
    cwd: packageDirectory,
  }).stdout.trim();
  const file = path.join(packageDirectory, fileName);
  const packed = path.join(temporaryDirectory, fileName);
  fs.copyFileSync(file, packed);
  fs.unlinkSync(file);

  const runNpmClient = (args) =>
    execaSync(client, args, { cwd: temporaryDirectory });

  runNpmClient(client === "pnpm" ? ["init"] : ["init", "-y"]);

  switch (client) {
    case "npm":
      // npm fails when engine requirement only with `--engine-strict`
      runNpmClient(["install", packed, "--engine-strict"]);
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

  console.log(
    chalk.green(
      outdent`
        Prettier installed
          at ${chalk.inverse(temporaryDirectory)}
          from ${chalk.inverse(packageDirectory)}
          with ${chalk.inverse(client)}.
      `,
    ),
  );

  fs.writeFileSync(
    path.join(temporaryDirectory, "index-proxy.mjs"),
    "export * from 'prettier';",
  );

  return temporaryDirectory;
}

export default installPrettier;
