import path from "node:path";
import url from "node:url";
import {
  prettierCliEntry,
  prettierCliMockableEntry,
  prettierMainEntry,
} from "./env.js";

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

async function getApiMockable() {
  const prettier = await import(url.pathToFileURL(prettierMainEntry));
  return prettier.__debug.mockable;
}

async function getCliMockable() {
  const cli = await import(url.pathToFileURL(prettierCliMockableEntry));
  return cli.mockable;
}

async function mockImplementations(options) {
  const [apiMockable, cliMockable] = await Promise.all([
    getApiMockable(),
    getCliMockable(),
  ]);

  cliMockable.mockImplementations({
    clearStreamText(stream, text) {
      const streamName =
        stream === process.stdout
          ? "process.stdout"
          : stream === process.stderr
            ? "process.stderr"
            : "unknown stream";
      stream.write(`\n[[Clear text(${streamName}): ${text}]]\n`);
    },
    // Time measure in format test
    getTimestamp: () => 0,
    isCI: () => Boolean(options.ci),
    isStreamTTY: (stream) =>
      stream === process.stdin
        ? Boolean(options.isTTY)
        : stream === process.stdout
          ? Boolean(options.stdoutIsTTY)
          : stream.isTTY,
    // eslint-disable-next-line require-await
    async writeFormattedFile(filename, content) {
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
        type: "cli:write-file",
        data: { filename, content },
      });
    },
  });

  apiMockable.mockImplementations({
    getPrettierConfigSearchStopDirectory: () =>
      url.fileURLToPath(new URL("./cli", import.meta.url)),
  });
}

async function run(options) {
  await mockImplementations(options);

  const { __promise: promise } = await import(
    url.pathToFileURL(prettierCliEntry)
  );
  await promise;
}

process.once("message", async (data) => {
  try {
    await run(data);
  } catch (error) {
    // For easier debugging
    // eslint-disable-next-line no-console
    console.error(error);
    process.send({ type: "worker:fault", error });
    throw error;
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
