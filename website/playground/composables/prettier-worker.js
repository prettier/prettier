import { getSelectedVersion } from "../utilities.js";

class WorkerApi {
  #worker;
  #counter = 0;
  #handlers = {};
  #ready;

  constructor(version) {
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
    const message = { type: "meta" };
    return this.#postMessage(message);
  }

  format(code, options, settings) {
    const message = { type: "format", code, options, settings };
    return this.#postMessage(message);
  }
}

const workers = {
  stable: new WorkerApi("stable"),
  next: new WorkerApi("next"),
};

let currentVersion = getSelectedVersion();

const worker = {
  getMetadata() {
    return workers[currentVersion].getMetadata();
  },
  format(code, options, settings) {
    return workers[currentVersion].format(code, options, settings);
  },
  switchVersion(newVersion) {
    currentVersion = newVersion;
  },
};

export { worker };
