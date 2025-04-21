import childProcess from "node:child_process";
import path from "node:path";
import url from "node:url";

// Though the doc says `childProcess.fork` accepts `URL`, but seems not true
// TODO: Use `URL` directly when we drop support for Node.js v14
const CLI_WORKER_FILE = url.fileURLToPath(
  new URL("./cli-worker.js", import.meta.url),
);
const INTEGRATION_TEST_DIRECTORY = url.fileURLToPath(
  new URL("./", import.meta.url),
);

const removeFinalNewLine = (string) =>
  string.endsWith("\n") ? string.slice(0, -1) : string;

const SUPPORTS_DISABLE_WARNING_FLAG =
  Number(process.versions.node.split(".")[0]) >= 20;

function runCliWorker(dir, args, options) {
  const result = {
    status: undefined,
    stdout: "",
    stderr: "",
    write: [],
  };

  const nodeOptions = options?.nodeOptions ?? [];
  const worker = childProcess.fork(CLI_WORKER_FILE, args, {
    cwd: dir,
    execArgv: [
      "--trace-deprecation",
      ...(SUPPORTS_DISABLE_WARNING_FLAG
        ? ["--disable-warning=ExperimentalWarning"]
        : []),
      ...nodeOptions,
    ],
    stdio: "pipe",
    env: {
      ...process.env,
      NO_COLOR: "1",
    },
  });

  worker.on("message", ({ action, data }) => {
    if (action === "write-file") {
      result.write.push(data);
    }
  });

  for (const stream of ["stdout", "stderr"]) {
    worker[stream].on("data", (data) => {
      result[stream] += data.toString();
    });
  }

  const removeStdioFinalNewLine = () => {
    for (const stream of ["stdout", "stderr"]) {
      result[stream] = removeFinalNewLine(result[stream]);
    }
  };

  return new Promise((resolve, reject) => {
    worker.on("close", (code) => {
      result.status = code;
      removeStdioFinalNewLine();
      resolve(result);
    });

    worker.on("error", (error) => {
      reject(error);
    });

    worker.send({ dir, options });
  });
}

function runPrettierCli(dir, args, options) {
  dir = path.resolve(INTEGRATION_TEST_DIRECTORY, dir);
  args = Array.isArray(args) ? args : [args];

  return runCliWorker(dir, args, options);
}

function runCli(dir, args = [], options = {}) {
  const promise = runPrettierCli(dir, args, options);
  const getters = {
    get status() {
      return promise.then(({ status }) => status);
    },
    get stdout() {
      return promise.then(({ stdout }) => stdout);
    },
    get stderr() {
      return promise.then(({ stderr }) => stderr);
    },
    get write() {
      return promise.then(({ write }) => write);
    },
    test: testResult,
    then(onFulfilled, onRejected) {
      return promise.then(onFulfilled, onRejected);
    },
  };

  return getters;

  function testResult(testOptions) {
    for (const name of ["status", "stdout", "stderr", "write"]) {
      test(`${options.title || ""}(${name})`, async () => {
        const result = await promise;
        let value = result[name];
        // \r is trimmed from jest snapshots by default;
        // manually replacing this character with /*CR*/ to test its true presence
        // If ignoreLineEndings is specified, \r is simply deleted instead
        if (name === "stdout" || name === "stderr") {
          value = result[name].replace(
            /\r/gu,
            options.ignoreLineEndings ? "" : "/*CR*/",
          );
        }

        if (name in testOptions) {
          if (name === "status" && testOptions[name] === "non-zero") {
            expect(value).not.toBe(0);
          } else if (typeof testOptions[name] === "function") {
            testOptions[name](value);
          } else {
            expect(value).toEqual(testOptions[name]);
          }
        } else {
          expect(value).toMatchSnapshot();
        }
      });
    }

    return getters;
  }
}

export default runCli;
