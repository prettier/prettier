import path from "node:path";
import url from "node:url";
import { Worker } from "node:worker_threads";

const CLI_WORKER_FILE = new URL("./cli-worker.js", import.meta.url);
const INTEGRATION_TEST_DIRECTORY = url.fileURLToPath(
  new URL("./", import.meta.url),
);

const streamToString = (stream) =>
  new Promise((resolve, reject) => {
    let result = "";

    stream.on("data", (data) => {
      result += data.toString();
    });

    stream.on("end", () => {
      resolve(result);
    });

    stream.on("error", (error) => {
      reject(error);
    });
  });

const removeFinalNewLine = (string) =>
  string.endsWith("\n") ? string.slice(0, -1) : string;

function runCliWorker(dir, args, options) {
  const result = {
    status: undefined,
    stdout: "",
    stderr: "",
    write: [],
  };

  const worker = new Worker(CLI_WORKER_FILE, {
    argv: args,
    execArgv: ["--trace-deprecation"],
    stdout: true,
    stderr: true,
    env: {
      ...process.env,
      FORCE_COLOR: 0,
    },
    workerData: {
      dir,
      options,
    },
    trackUnmanagedFds: false,
  });

  worker.on("message", ({ action, data }) => {
    if (action === "write-file") {
      result.write.push(data);
    }
  });

  return new Promise((resolve, reject) => {
    worker.on("exit", async (code) => {
      result.status = code;
      result.stdout = removeFinalNewLine(await streamToString(worker.stdout));
      result.stderr = removeFinalNewLine(await streamToString(worker.stderr));
      resolve(result);
    });

    worker.on("error", (error) => {
      reject(error);
    });

    worker.postMessage("run");
  });
}

async function runPrettierCli(dir, args, options) {
  dir = path.resolve(INTEGRATION_TEST_DIRECTORY, dir);
  args = Array.isArray(args) ? args : [args];

  // Worker doesn't support `chdir`
  const cwd = process.cwd();
  process.chdir(dir);

  try {
    return await runCliWorker(dir, args, options);
  } finally {
    process.chdir(cwd);
  }
}

let runningCli;
function runCli(dir, args = [], options = {}) {
  let promise;
  const getters = {
    get status() {
      return run().then(({ status }) => status);
    },
    get stdout() {
      return run().then(({ stdout }) => stdout);
    },
    get stderr() {
      return run().then(({ stderr }) => stderr);
    },
    get write() {
      return run().then(({ write }) => write);
    },
    test: testResult,
    then(onFulfilled, onRejected) {
      return run().then(onFulfilled, onRejected);
    },
  };

  return getters;

  function run() {
    if (runningCli) {
      throw new Error("Please wait for previous CLI to exit.");
    }

    if (!promise) {
      promise = runPrettierCli(dir, args, options).finally(() => {
        runningCli = undefined;
      });
      runningCli = promise;
    }
    return promise;
  }

  function testResult(testOptions) {
    for (const name of ["status", "stdout", "stderr", "write"]) {
      test(`${options.title || ""}(${name})`, async () => {
        const result = await run();
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
