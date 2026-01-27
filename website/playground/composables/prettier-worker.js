/**
@import {PlaygroundSettings} from "./playground-settings.js"
@import {FormatMessage, MetaMessage} from "../../static/worker.mjs"
*/

class WorkerApi {
  #worker = new Worker("/worker.mjs", { type: "module" });
  #counter = 0;
  #handlers = {};

  constructor() {
    const worker = this.#worker;
    const handlers = this.#handlers;

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

  #postMessage(message) {
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

const worker = new WorkerApi();

export { worker };
