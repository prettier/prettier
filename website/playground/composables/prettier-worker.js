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
    return this.#postMessage({ type: "meta" });
  }

  format(code, options, debug = {}) {
    return this.#postMessage({ type: "format", code, options, debug });
  }
}

const worker = new WorkerApi();

export { worker };
