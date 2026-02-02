/**
@import {PlaygroundSettings} from "./playground-settings.js"
@import {FormatMessage, MetaMessage} from "../../static/worker.mjs"
*/

function getSelectedVersion() {
  const params = new URLSearchParams(window.location.search);
  return params.get("version") === "next" ? "next" : "stable";
}

class WorkerApi {
  #worker;
  #counter = 0;
  #handlers = {};
  #ready;

  constructor(version = "stable") {
    const libDir = version === "next" ? "lib-next" : "lib-stable";
    this.#worker = new Worker(`/worker.mjs?lib=${libDir}`, { type: "module" });
    const worker = this.#worker;
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
  }

  async #postMessage(message) {
    await this.#ready;
    const uid = ++this.#counter;
    const worker = this.#worker;
    return new Promise((resolve, reject) => {
      this.#handlers[uid] = [resolve, reject];
      worker.postMessage({ uid, message });
    });
  }

  getMetadata() {
    /** @type {MetaMessage} */
    const message = { type: "meta" };
    return this.#postMessage(message);
  }

  /**
   * @param {FormatMessage["code"]} code
   * @param {FormatMessage["options"]} options
   * @param {FormatMessage["settings"]} settings
   */
  format(code, options, settings) {
    /** @type {FormatMessage} */
    const message = { type: "format", code, options, settings };
    return this.#postMessage(message);
  }
}

const worker = new WorkerApi(getSelectedVersion());

export { worker };
