"use strict";

function flattenDoc(doc) {
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
  } else if (doc.type === "if-break") {
    return Object.assign({}, doc, {
      breakContents: doc.breakContents != null
        ? flattenDoc(doc.breakContents)
        : null,
      flatContents: doc.flatContents != null
        ? flattenDoc(doc.flatContents)
        : null
    });
  } else if (doc.type === "group") {
    return Object.assign({}, doc, {
      contents: flattenDoc(doc.contents),
      expandedStates: doc.expandedStates
        ? doc.expandedStates.map(flattenDoc)
        : doc.expandedStates
    });
  } else if (doc.contents) {
    return Object.assign({}, doc, { contents: flattenDoc(doc.contents) });
  } else {
    return doc;
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

  if (doc.type === "break-parent") {
    return "breakParent";
  }

  if (doc.type === "concat") {
    return "[" + doc.parts.map(printDoc).join(", ") + "]";
  }

  if (doc.type === "indent") {
    return "indent(" + printDoc(doc.contents) + ")";
  }

  if (doc.type === "align") {
    return "align(" + doc.n + ", " + printDoc(doc.contents) + ")";
  }

  if (doc.type === "if-break") {
    return (
      "ifBreak(" +
      printDoc(doc.breakContents) +
      (doc.flatContents ? ", " + printDoc(doc.flatContents) : "") +
      ")"
    );
  }

  if (doc.type === "group") {
    if (doc.expandedStates) {
      return (
        "conditionalGroup(" +
        "[" +
        doc.expandedStates.map(printDoc).join(",") +
        "])"
      );
    }

    return (
      (doc.break ? "wrappedGroup" : "group") +
      "(" +
      printDoc(doc.contents) +
      ")"
    );
  }

  if (doc.type === "line-suffix") {
    return "lineSuffix(" + printDoc(doc.contents) + ")";
  }

  if (doc.type === "line-suffix-boundary") {
    return "lineSuffixBoundary";
  }

  throw new Error("Unknown doc type " + doc.type);
}

module.exports = {
  printDocToDebug: function(doc) {
    return printDoc(flattenDoc(doc));
  }
};
