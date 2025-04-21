import fs from "node:fs";
import path from "node:path";
import readline from "node:readline";
import url from "node:url";
import { prettierCli, prettierMainEntry } from "./env.js";

const normalizeToPosix =
  path.sep === "\\"
    ? (filepath) => replaceAll(filepath, "\\", "/")
    : (filepath) => filepath;
const hasOwn =
  Object.hasOwn ??
  ((object, property) =>
    // eslint-disable-next-line prefer-object-has-own
    Object.prototype.hasOwnProperty.call(object, property));
const replaceAll = (text, find, replacement) =>
  text.replaceAll
    ? text.replaceAll(find, replacement)
    : text.split(find).join(replacement);

async function run(options) {
  Date.now = () => 0;

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
        : filename,
    );

  readline.clearLine = (stream) => {
    stream.write(
      `\n[[called readline.clearLine(${
        stream === process.stdout
          ? "process.stdout"
          : stream === process.stderr
            ? "process.stderr"
            : "unknown stream"
      })]]\n`,
    );
  };

  process.stdin.isTTY = Boolean(options.isTTY);
  process.stdout.isTTY = Boolean(options.stdoutIsTTY);

  const prettier = await import(url.pathToFileURL(prettierMainEntry));
  const { mockable } = prettier.__debug;

  // We cannot use `jest.setMock("get-stream", impl)` here, because in the
  // production build everything is bundled into one file so there is no
  // "get-stream" module to mock.
  // eslint-disable-next-line require-await
  mockable.getStdin = async () => options.input || "";
  mockable.isCI = () => Boolean(options.ci);
  mockable.getPrettierConfigSearchStopDirectory = () =>
    url.fileURLToPath(new URL("./cli", import.meta.url));
  // eslint-disable-next-line require-await
  mockable.writeFormattedFile = async (filename, content) => {
    filename = normalizeToPosix(path.relative(process.cwd(), filename));
    if (
      options.mockWriteFileErrors &&
      hasOwn(options.mockWriteFileErrors, filename)
    ) {
      throw new Error(
        options.mockWriteFileErrors[filename] + " (mocked error)",
      );
    }

    process.send({
      action: "write-file",
      data: { filename, content },
    });
  };

  const { __promise: promise } = await import(url.pathToFileURL(prettierCli));
  await promise;
}

process.once("message", async (data) => {
  try {
    await run(data);
  } finally {
    // On MacOS, if we exit too quick the stdio won't received on main thread
    if (process.platform === "darwin") {
      await Promise.all(
        ["stdout", "stderr"].map(
          (stream) =>
            new Promise((resolve) => {
              process[stream].once("finish", resolve);
              process[stream].end();
            }),
        ),
      );
    }
    process.exit();
  }
});
