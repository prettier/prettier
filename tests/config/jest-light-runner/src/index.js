import { Piscina } from "piscina";
import supportsColor from "supports-color";
import { MessageChannel } from "worker_threads";
import os from "os";

/** @typedef {import("@jest/test-result").Test} Test */

const piscina = new Piscina({
  filename: new URL("./worker-runner.js", import.meta.url).href,
  maxThreads: os.cpus().length / 2,
  env: {
    // Workers don't have a tty; we whant them to inherit
    // the color support level from the main thread.
    FORCE_COLOR: supportsColor.stdout.level,
    ...process.env,
  },
});

export default class LightRunner {
  #config;

  constructor(config) {
    this.#config = config;
  }

  /**
   * @param {Array<Test>} tests
   * @param {*} watcher
   * @param {*} onStart
   * @param {*} onResult
   * @param {*} onFailure
   */
  runTests(tests, watcher, onStart, onResult, onFailure) {
    const { updateSnapshot } = this.#config;

    return Promise.all(
      tests.map((test) => {
        const mc = new MessageChannel();
        mc.port2.onmessage = () => onStart(test);
        mc.port2.unref();

        return piscina
          .run(
            { test, updateSnapshot, port: mc.port1 },
            { transferList: [mc.port1] }
          )
          .then(
            (result) => void onResult(test, result),
            (error) => void onFailure(test, error)
          );
      })
    );
  }
}
