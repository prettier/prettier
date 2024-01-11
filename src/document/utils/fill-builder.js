import { fill } from "../builders.js";

function fillBuilder() {
  const parts = [];
  let pendingDocs = [];
  function flush() {
    parts.push(pendingDocs);
    pendingDocs = [];
  }

  const self = {
    append(doc) {
      pendingDocs.push(doc);
      return self;
    },
    appendLine(doc) {
      flush();
      pendingDocs = [];
      parts.push(doc);
      return self;
    },
    build() {
      flush();
      return fill(parts);
    },
  };
  return self;
}

export { fillBuilder };
