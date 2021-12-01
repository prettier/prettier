import path from "node:path";
import { promises as fs } from "node:fs";
import { execa } from "execa";
import tempy from "tempy";
import { PROJECT_ROOT } from "../../scripts/utils/index.mjs";

const allowedClients = new Set(["yarn", "npm", "pnpm"]);

let client = process.env.NPM_CLIENT;
if (!allowedClients.has(client)) {
  client = "yarn";
}

async function installPrettierPackage(packageDir) {
  const tmpDir = tempy.directory();
  const { stdout: fileName } = await execa("npm", ["pack"], {
    cwd: packageDir,
  });
  const file = path.join(packageDir, fileName);
  const packed = path.join(tmpDir, fileName);
  await fs.copyFile(file, packed);
  await fs.unlink(file);

  await execa(client, ["init", "-y"], { cwd: tmpDir });

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

  await execa(client, installArguments, { cwd: tmpDir });
  await fs.unlink(packed);

  return path.join(tmpDir, "node_modules/prettier");
}

async function installPrettier() {
  const isProduction = process.env.NODE_ENV === "production";
  const TEST_STANDALONE = Boolean(process.env.TEST_STANDALONE);
  const INSTALL_PACKAGE = Boolean(process.env.INSTALL_PACKAGE);

  let PRETTIER_DIR = isProduction
    ? path.join(PROJECT_ROOT, "dist")
    : PROJECT_ROOT;
  if (INSTALL_PACKAGE || (isProduction && !TEST_STANDALONE)) {
    PRETTIER_DIR = await installPrettierPackage(PRETTIER_DIR);
  }

  process.env.PRETTIER_DIR = PRETTIER_DIR;
}

export default installPrettier();
