"use strict";
function flattenDoc(doc) {
  if (!doc || typeof doc === "string" || doc.type === "line") {
    return doc;
  }

  if (doc.type === "concat") {
    var res = [];

    for (var i = 0; i < doc.parts.length; ++i) {
      const doc2 = doc.parts[i];
      if (typeof doc2 !== "string" && doc2.type === "concat") {
        [].push.apply(res, flattenDoc(doc2).parts);
      } else {
        const flattened = flattenDoc(doc2);
        if (flattened !== "") {
          res.push(flattened);
        }
      }
    }

    return Object.assign({}, doc, { parts: res });
  }

  if (doc.type === "indent") {
    return Object.assign({}, doc, { contents: flattenDoc(doc.contents) });
  }

  if (doc.type === "if-break") {
    return Object.assign({}, doc, {
      breakContents: flattenDoc(doc.breakContents),
      flatContents: flattenDoc(doc.flatContents)
    });
  }

  if (doc.type === "group") {
    return Object.assign({}, doc, {
      contents: flattenDoc(doc.contents),
      expandedStates: doc.expandedStates
        ? doc.expandedStates.map(flattenDoc)
        : doc.expandedStates
    });
  }
}

function printDoc(doc) {
  if (typeof doc === "string") {
    return JSON.stringify(doc);
  }

  if (doc.type === "line") {
    if (doc.literalline) {
      return "literalline";
    }
    if (doc.hard) {
      return "hardline";
    }
    if (doc.soft) {
      return "softline";
    }
    return "line";
  }

  if (doc.type === "concat") {
    return "[" + doc.parts.map(printDoc).join(", ") + "]";
  }

  if (doc.type === "indent") {
    return "indent(" + doc.n + ", " + printDoc(doc.contents) + ")";
  }

  if (doc.type === "if-break") {
    return "ifBreak(" +
      printDoc(doc.breakContents) +
      (doc.flatContents ? ", " + printDoc(doc.flatContents) : "") +
      ")";
  }

  if (doc.type === "group") {
    return (doc.break
      ? "multilineGroup"
      : doc.expandedStates ? "conditionalGroup" : "group") +
      "(" +
      printDoc(doc.contents) +
      (doc.expandedStates
        ? ", [" + doc.expandedStates.map(printDoc).join(",") + "]"
        : "") +
      ")";
  }
}

module.exports = {
  printDocToDebug: function(doc) {
    return printDoc(flattenDoc(doc));
  }
};
