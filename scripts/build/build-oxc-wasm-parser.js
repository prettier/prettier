import assert from "node:assert/strict";
import { existsSync, promises as fs } from "node:fs";
import url from "node:url";
import spawn from "nano-spawn";
import packageJson from "../../package.json" with { type: "json" };

const DIRECTORY_NAME = "prettier-oxc-wasm-parser";
const PACKAGE_NAME = "@oxc-parser/binding-wasm32-wasi";

const TEMPORARY_DIRECTORY = new URL("../../.tmp/", import.meta.url);

async function install(version) {
  const directory = new URL(`./installing.${Date.now()}/`, TEMPORARY_DIRECTORY);

  await fs.rm(directory, { force: true, recursive: true });
  await fs.mkdir(directory, { recursive: true });
  await spawn("yarn init", { cwd: directory });
  await fs.writeFile(new URL("./yarn.lock", directory), "");
  await fs.writeFile(new URL(".yarnrc.yml", directory), "");
  await spawn("yarn config set supportedArchitectures.cpu wasm32", {
    cwd: directory,
  });

  await spawn(`yarn add ${PACKAGE_NAME}@${version}`, { cwd: directory });

  assert.ok(existsSync(new URL(`./node_modules/${PACKAGE_NAME}/`, directory)));

  const { version: installedVersion } = JSON.parse(
    await fs.readFile(
      new URL(`./node_modules/${PACKAGE_NAME}/package.json`, directory),
    ),
  );

  assert.equal(installedVersion, version);

  return directory;
}

async function inlineWasmBinary(directory) {
  const packageDirectory = new URL(
    "./node_modules/@oxc-parser/binding-wasm32-wasi/",
    directory,
  );
  const entryFile = new URL("./browser-bundle.js", packageDirectory);
  const wasmFile = new URL("./parser.wasm32-wasi.wasm", packageDirectory);

  let text = await fs.readFile(entryFile, "utf8");
  const wasm = await fs.readFile(wasmFile, "base64");

  text = text.replace(
    "await fetch(__wasmUrl).then((res) => res.arrayBuffer())",
    `Uint8Array.fromBase64('${JSON.stringify(wasm)}').buffer`,
  );
  await fs.writeFile(entryFile, text);
}

async function buildOxcWasmParser() {
  const version = packageJson.dependencies["oxc-parser"];
  const directory = new URL(
    `./${DIRECTORY_NAME}@${version}/`,
    TEMPORARY_DIRECTORY,
  );
  const entry = new URL("./index.mjs", directory);

  if (!existsSync(entry)) {
    await fs.rm(directory, { recursive: true, force: true });

    const installDirectory = await install(version);
    await fs.rename(installDirectory, directory);

    await fs.writeFile(
      entry,
      `export {parseSync as parse} from '${PACKAGE_NAME}/browser-bundle.js'`,
    );

    await inlineWasmBinary(directory);
  }

  return {
    entry: url.fileURLToPath(entry),
    directory: url.fileURLToPath(directory),
  };
}

export default buildOxcWasmParser;
