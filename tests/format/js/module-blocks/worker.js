let worker = new Worker(module {
  onmessage = function({data}) {
    let mod = import(data);
    postMessage(mod.fn());
  }
}, {type: "module"});

let worker = new Worker(module {
  onmessage = function({data}) {
    let mod = import(data);
    postMessage(mod.fn());
  }
}, {type: "module", foo: "bar" });

worker.postMessage(module { export function fn() { return "hello!" } });
