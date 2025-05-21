import { spawnSync } from "node:child_process";
import crypto from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { performance } from "node:perf_hooks";
import { outdent } from "outdent";
import picocolors from "picocolors";

const isWindows = process.platform === "win32";
// https://github.com/sindresorhus/nano-spawn/blob/7f3fbe6590eec44f7e90f7735d173258dd80b420/source/windows.js#L71
const escapeFile = isWindows
  ? (file) => file.replace(/([()\][%!^"`<>&|;, *?])/gu, "^$1")
  : (file) => file;
// https://github.com/sindresorhus/nano-spawn/blob/7f3fbe6590eec44f7e90f7735d173258dd80b420/source/windows.js#L66
const escapeArgument = isWindows
  ? (argument) =>
      escapeFile(
        escapeFile(
          `"${argument
            .replace(/(\\*)"/gu, String.raw`$1$1\"`)
            .replace(/(\\*)$/u, "$1$1")}"`,
        ),
      )
  : (argument) => argument;
const spawn = (command, args, options) =>
  spawnSync(
    [
      escapeFile(command),
      ...args.map((argument) => escapeArgument(argument)),
    ].join(" "),
    {
      ...options,
      shell: true,
    },
  );
const createTemporaryDirectory = () => {
  const directory = path.join(
    // The following quoted from https://github.com/es-tooling/module-replacements/blob/27d1acd38f19741e31d2eae561a5c8a914373fc5/docs/modules/tempy.md?plain=1#L20-L21, not sure if it's true
    // MacOS and possibly some other platforms return a symlink from `os.tmpdir`.
    // For some applications, this can cause problems; thus, we use `realpath`.
    fs.realpathSync(os.tmpdir()),
    crypto.randomBytes(16).toString("hex"),
  );
  fs.mkdirSync(directory);
  return directory;
};

const allowedClients = new Set(["yarn", "npm", "pnpm"]);

let client = process.env.PRETTIER_INSTALL_NPM_CLIENT;
if (!allowedClients.has(client)) {
  client = "yarn";
}

const directoriesToClean = new Set();

process.once("exit", cleanUp);

function cleanUp() {
  if (directoriesToClean.size === 0) {
    return;
  }
  console.log(picocolors.green("Removing installed Prettier:"));

  for (const directory of directoriesToClean) {
    // Node.js<14 don't support `fs.rmSync`
    try {
      fs.rmSync(directory, { force: true, recursive: true });
    } catch {
      // No op
    }

    if (fs.existsSync(directory)) {
      console.error(picocolors.red(` - ${picocolors.inverse(directory)} FAIL`));
    } else {
      console.log(picocolors.green(` - ${picocolors.inverse(directory)} DONE`));
    }
  }
}

function installPrettier(packageDirectory) {
  const start = performance.now();
  const temporaryDirectory = createTemporaryDirectory();
  directoriesToClean.add(temporaryDirectory);
  const fileName = spawn("npm", ["pack"], {
    cwd: packageDirectory,
    encoding: "utf8",
  }).stdout.trim();
  const file = path.join(packageDirectory, fileName);
  const packed = path.join(temporaryDirectory, fileName);
  fs.copyFileSync(file, packed);
  fs.unlinkSync(file);

  const runNpmClient = (args) =>
    spawn(client, args, { cwd: temporaryDirectory });

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
    picocolors.green(
      outdent`
        Prettier installed
          at   ${picocolors.inverse(temporaryDirectory)}
          from ${picocolors.inverse(packageDirectory)}
          with ${picocolors.inverse(client)}
          in   ${picocolors.inverse(`${performance.now() - start}ms`)}.
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
