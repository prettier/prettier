
function iterDoc(topDoc, func) {
  const docs = [ topDoc ];
  while (docs.length !== 0) {
    const doc = docs.pop();
    let res = undefined;

    if (typeof doc === "string") {
      const res = func("string", doc);

      if (res) {
        return res;
      }
    } else {
      const res = func(doc.type, doc);

      if (res) {
        return res;
      }

      if (doc.type === "concat") {
        for (var i = doc.parts.length - 1; i >= 0; i--) {
          docs.push(doc.parts[i]);
        }
      } else if (doc.type === "if-break") {
        if (doc.breakContents) {
          docs.push(doc.breakContents);
        }
        if (doc.flatContents) {
          docs.push(doc.flatContents);
        }
      } else if (doc.type !== "line") {
        docs.push(doc.contents);
      }
    }
  }
}

function isEmpty(n) {
  return typeof n === "string" && n.length === 0;
}

function getFirstString(doc) {
  return iterDoc(doc, (type, doc) => {
    if (type === "string" && doc.trim().length !== 0) {
      return doc;
    }
  });
}

function hasHardLine(doc) {
  // TODO: If we hit a group, check if it's already marked as a
  // multiline group because they should be marked bottom-up.
  return !!iterDoc(doc, (type, doc) => {
    switch (type) {
      case "line":
        if (doc.hard) {
          return true;
        }

        break;
    }
  });
}

module.exports = {
  isEmpty,
  getFirstString,
  hasHardLine,
};
