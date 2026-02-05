/**
@import {PlaygroundSettings} from "./playground-settings.js"
@import {FormatMessage, MetaMessage} from "../../static/worker.mjs"
*/
class WorkerApi {
  #worker;
  #counter = 0;
  #handlers = {};

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

    const worker = new Worker(`/worker.mjs?version=${version}`, {
      type: "module",
    });
    this.#worker[version] = worker;
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

    return worker;
  }

  #postMessage(message) {
    const worker = this.#initWorker(message.version);
    const uid = ++this.#counter;
    return new Promise((resolve, reject) => {
      this.#handlers[uid] = [resolve, reject];
      worker.postMessage({ uid, message });
    });
  }

  /**
   * @param {MetaMessage["version"]} version
   */
  getMetadata(version) {
    /** @type {MetaMessage} */
    const message = { type: "meta", version };
    return this.#postMessage(message);
  }

  /**
   * @param {FormatMessage["code"]} code
   * @param {FormatMessage["options"]} options
   * @param {FormatMessage["settings"]} settings
   * @param {FormatMessage["version"]} version
   */
  format(code, options, settings, version) {
    /** @type {FormatMessage} */
    const message = { type: "format", version, code, options, settings };
    return this.#postMessage(message);
  }
}

const worker = new WorkerApi();

export { worker };
