import path from "node:path";
import fs from "node:fs";
import { execaSync } from "execa";
import tempy from "tempy";

const allowedClients = new Set(["yarn", "npm", "pnpm"]);

let client = process.env.NPM_CLIENT;
if (!allowedClients.has(client)) {
  client = "yarn";
}

function installPrettier(packageDir) {
  const tmpDir = tempy.directory();
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

  return path.join(tmpDir, "node_modules/prettier");
}

export default installPrettier;
