let worker = new Worker(module {
  onmessage = function({data}) {
    let mod = import(data);
    postMessage(mod.fn());
  }
}, {type: "module"});

worker.postMessage(module { export function fn() { return "hello!" } });
