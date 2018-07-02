/** @flow */

"use strict";

/*::
import type { Doc } from "./types";
*/

function flattenDoc /*:: <T: Doc> */(doc /*: T */) /*: T */ {
  if (typeof doc === "string") {
    return doc;
  }

  if (doc.type === "concat") {
    const res = [];

    for (let i = 0; i < doc.parts.length; ++i) {
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
      breakContents: doc.breakContents && flattenDoc(doc.breakContents),
      flatContents: doc.flatContents && flattenDoc(doc.flatContents)
    });
  } else if (doc.type === "group") {
    return Object.assign({}, doc, {
      contents: flattenDoc(doc.contents),
      expandedStates: doc.expandedStates
        ? doc.expandedStates.map(flattenDoc)
        : doc.expandedStates
    });
  } else if (doc.contents) {
    // $FlowFixMe
    return Object.assign({}, doc, { contents: flattenDoc(doc.contents) });
  }

  return doc;
}

function printDoc(doc /*: Doc */) {
  if (typeof doc === "string") {
    return JSON.stringify(doc);
  }

  if (doc.type === "line") {
    if (doc.literal) {
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
    if (typeof doc.n === "number") {
      if (doc.n === -Infinity) {
        return "dedentToRoot(" + printDoc(doc.contents) + ")";
      }

      if (doc.n < 0) {
        return "dedent(" + printDoc(doc.contents) + ")";
      }
    } else if (doc.n.type === "root") {
      return "markAsRoot(" + printDoc(doc.contents) + ")";
    }

    return (
      "align(" + JSON.stringify(doc.n) + ", " + printDoc(doc.contents) + ")"
    );
  }

  if (doc.type === "if-break") {
    return (
      "ifBreak(" +
      // This should never be empty but the current type says it's optional
      // Change this when we finally type check the printers
      // $FlowFixMe
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

  if (doc.type === "fill") {
    return "fill" + "(" + doc.parts.map(printDoc).join(", ") + ")";
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
  printDocToDebug: function(doc /*: Doc */) {
    return printDoc(flattenDoc(doc));
  }
};
