import path from "node:path";
import { Worker } from "node:worker_threads";
import stripAnsi from "strip-ansi";
import createEsmUtils from "esm-utils";
import { prettierCli, thirdParty } from "./env.js";

const { __dirname, require } = createEsmUtils(import.meta);
const CLI_WORKER_FILE = require.resolve("./cli-worker.js");

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

function runCliWorker(dir, args, options) {
  const result = {
    status: undefined,
    stdout: "",
    stderr: "",
    write: [],
  };

  const worker = new Worker(CLI_WORKER_FILE, {
    argv: args,
    stdout: true,
    stderr: true,
    env: {
      PRETTIER_DIR: process.env.PRETTIER_DIR,
    },
    workerData: {
      dir,
      prettierCli,
      thirdParty,
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
      result.stdout = await streamToString(worker.stdout);
      result.stderr = await streamToString(worker.stderr);
      resolve(result);
    });

    worker.on("error", (error) => {
      reject(error);
    });

    worker.postMessage("run");
  });
}

async function run(dir, args, options) {
  dir = normalizeDir(dir);
  args = Array.isArray(args) ? args : [args];

  // Worker doesn't support `chdir`
  const cwd = process.cwd();
  process.chdir(dir);

  try {
    return await runCliWorker(dir, args, options, cwd);
  } finally {
    process.chdir(cwd);
  }
}

let runningCli;
function runPrettier(dir, args = [], options = {}) {
  let promise;
  const getters = {
    get status() {
      return runCli().then(({ status }) => status);
    },
    get stdout() {
      return runCli().then(({ stdout }) => stdout);
    },
    get stderr() {
      return runCli().then(({ stderr }) => stderr);
    },
    get write() {
      return runCli().then(({ write }) => write);
    },
    test: testResult,
    then(onFulfilled, onRejected) {
      return runCli().then(onFulfilled, onRejected);
    },
  };

  return getters;

  function runCli() {
    if (runningCli) {
      throw new Error("Please wait for previous CLI to exit.");
    }

    if (!promise) {
      promise = run(dir, args, options).finally(() => {
        runningCli = undefined;
      });
      runningCli = promise;
    }
    return promise;
  }

  function testResult(testOptions) {
    for (const name of ["status", "stdout", "stderr", "write"]) {
      test(`${options.title || ""}(${name})`, async () => {
        const result = await runCli();
        const value =
          // \r is trimmed from jest snapshots by default;
          // manually replacing this character with /*CR*/ to test its true presence
          // If ignoreLineEndings is specified, \r is simply deleted instead
          typeof result[name] === "string"
            ? options.ignoreLineEndings
              ? stripAnsi(result[name]).replace(/\r/g, "")
              : stripAnsi(result[name]).replace(/\r/g, "/*CR*/")
            : result[name];
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

function normalizeDir(dir) {
  const isRelative = dir[0] !== "/";
  return isRelative ? path.resolve(__dirname, dir) : dir;
}

export default runPrettier;
