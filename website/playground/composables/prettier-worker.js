/**
@import {PlaygroundSettings} from "./playground-settings.js"
@import {FormatMessage, MetaMessage} from "../../static/worker.mjs"
*/
class WorkerApi {
  #worker;
  #counter = 0;
  #handlers = {};
  #ready;

  constructor() {
    this.#worker = {
      stable: null,
      next: null,
    };
  }

  #initWorker(version) {
    if (this.#worker[version]) {
      return this.#worker[version];
    }

    const libDir = version === "next" ? "lib-next" : "lib-stable";
    const worker = new Worker(`/worker.mjs?lib=${libDir}`, { type: "module" });
    this.#worker[version] = worker;
    const handlers = this.#handlers;

    this.#ready = new Promise((resolve) => {
      const onReady = (event) => {
        if (event.data?.type === "ready") {
          worker.removeEventListener("message", onReady);
          resolve();
        }
      };
      worker.addEventListener("message", onReady);
    });

    worker.addEventListener("message", (event) => {
      const { uid, message, error } = event.data;

      if (!handlers[uid]) {
        return;
      }

      const [resolve, reject] = handlers[uid];
      delete handlers[uid];

      if (error) {
        reject(error);
      } else {
        resolve(message);
      }
    });

    return worker;
  }

  async #postMessage(message, version) {
    const worker = this.#initWorker(version);
    await this.#ready;
    const uid = ++this.#counter;
    return new Promise((resolve, reject) => {
      this.#handlers[uid] = [resolve, reject];
      worker.postMessage({ uid, message });
    });
  }

  /**
   * @param {string} version
   */
  getMetadata(version) {
    /** @type {MetaMessage} */
    const message = { type: "meta" };
    return this.#postMessage(message, version);
  }

  /**
   * @param {FormatMessage["code"]} code
   * @param {FormatMessage["options"]} options
   * @param {FormatMessage["settings"]} settings
   */
  format(code, options, settings) {
    /** @type {FormatMessage} */
    const message = { type: "format", code, options, settings };
    return this.#postMessage(message, settings.releaseChannel);
  }
}

const worker = new WorkerApi();

export { worker };
