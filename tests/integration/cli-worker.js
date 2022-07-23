import { workerData, parentPort } from "node:worker_threads";
import fs from "node:fs";
import path from "node:path";
import url from "node:url";
import { cosmiconfig } from "cosmiconfig";

async function run() {
  const { options, thirdParty: thirdPartyModuleFile, prettierCli } = workerData;

  Date.now = () => 0;
  // eslint-disable-next-line require-await
  fs.promises.writeFile = async (filename, content) => {
    parentPort.postMessage({
      action: "write-file",
      data: { filename, content },
    });
  };

  /*
    A fake non-existing directory to test plugin search won't crash.

    See:
    - `isDirectory` function in `src/common/load-plugins.js`
    - Test file `./__tests__/plugin-virtual-directory.js`
    - Pull request #5819
  */
  const originalStat = fs.promises.stat;
  fs.promises.statSync = (filename) =>
    originalStat(
      path.basename(filename) === "virtualDirectory"
        ? import.meta.url
        : filename
    );

  process.stdin.isTTY = Boolean(options.isTTY);
  process.stdout.isTTY = Boolean(options.stdoutIsTTY);

  const { default: thirdParty } = await import(
    url.pathToFileURL(thirdPartyModuleFile)
  );

  // We cannot use `jest.setMock("get-stream", impl)` here, because in the
  // production build everything is bundled into one file so there is no
  // "get-stream" module to mock.
  // eslint-disable-next-line require-await
  thirdParty.getStdin = async () => options.input || "";
  thirdParty.isCI = () => Boolean(options.ci);
  thirdParty.cosmiconfig = (moduleName, options) =>
    cosmiconfig(moduleName, {
      ...options,
      stopDir: url.fileURLToPath(new URL("./cli", import.meta.url)),
    });
  thirdParty.findParentDir = () => process.cwd();

  const { promise } = await import(url.pathToFileURL(prettierCli));
  await promise;
}

parentPort.on("message", async () => {
  const originalExit = process.exit;

  // https://github.com/nodejs/node/issues/30491
  process.stdout.cork();
  process.stderr.cork();
  process.exit = (code) => {
    process.stdout.end();
    process.stderr.end();
    originalExit(code);
  };

  try {
    await run();
  } finally {
    process.exit();
  }
});
