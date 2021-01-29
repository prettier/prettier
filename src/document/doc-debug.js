"use strict";

const { isConcat, getDocParts } = require("./doc-utils");

function flattenDoc(doc) {
  if (isConcat(doc)) {
    const res = [];
    for (const part of getDocParts(doc)) {
      if (isConcat(part)) {
        res.push(...flattenDoc(part).parts);
      } else {
        const flattened = flattenDoc(part);
        if (flattened !== "") {
          res.push(flattened);
        }
      }
    }

    return { type: "concat", parts: res };
  } else if (doc.type === "if-break") {
    return {
      ...doc,
      breakContents:
        doc.breakContents != null ? flattenDoc(doc.breakContents) : null,
      flatContents:
        doc.flatContents != null ? flattenDoc(doc.flatContents) : null,
    };
  } else if (doc.type === "group") {
    return {
      ...doc,
      contents: flattenDoc(doc.contents),
      expandedStates: doc.expandedStates
        ? doc.expandedStates.map(flattenDoc)
        : doc.expandedStates,
    };
  } else if (doc.type === "fill") {
    return { type: "fill", parts: doc.parts.map(flattenDoc) };
  } else if (doc.contents) {
    return { ...doc, contents: flattenDoc(doc.contents) };
  }
  return doc;
}

function printDocToDebug(doc) {
  const symbolsToKeysMap = Object.create(null);
  const usedKeysForSymbols = new Set();
  return printDoc(flattenDoc(doc));

  function printDoc(doc, index, parentParts) {
    if (typeof doc === "string") {
      return JSON.stringify(doc);
    }

    if (isConcat(doc)) {
      return `[${getDocParts(doc).map(printDoc).filter(Boolean).join(", ")}]`;
    }

    if (doc.type === "line") {
      const withBreakParent =
        Array.isArray(parentParts) &&
        parentParts[index + 1] &&
        parentParts[index + 1].type === "break-parent";
      if (doc.literal) {
        return withBreakParent
          ? "literalline"
          : "literallineWithoutBreakParent";
      }
      if (doc.hard) {
        return withBreakParent ? "hardline" : "hardlineWithoutBreakParent";
      }
      if (doc.soft) {
        return "softline";
      }
      return "line";
    }

    if (doc.type === "break-parent") {
      const afterHardline =
        Array.isArray(parentParts) &&
        parentParts[index - 1] &&
        parentParts[index - 1].type === "line" &&
        parentParts[index - 1].hard;
      return afterHardline ? undefined : "breakParent";
    }

    if (doc.type === "trim") {
      return "trim";
    }

    if (doc.type === "indent") {
      return "indent(" + printDoc(doc.contents) + ")";
    }

    if (doc.type === "align") {
      return doc.n === Number.NEGATIVE_INFINITY
        ? "dedentToRoot(" + printDoc(doc.contents) + ")"
        : doc.n < 0
        ? "dedent(" + printDoc(doc.contents) + ")"
        : doc.n.type === "root"
        ? "markAsRoot(" + printDoc(doc.contents) + ")"
        : "align(" +
          JSON.stringify(doc.n) +
          ", " +
          printDoc(doc.contents) +
          ")";
    }

    if (doc.type === "if-break") {
      return (
        "ifBreak(" +
        printDoc(doc.breakContents) +
        (doc.flatContents ? ", " + printDoc(doc.flatContents) : "") +
        (doc.groupId
          ? (!doc.flatContents ? ', ""' : "") +
            `, { groupId: ${printGroupId(doc.groupId)} }`
          : "") +
        ")"
      );
    }

    if (doc.type === "group") {
      const optionsParts = [];

      if (doc.break && doc.break !== "propagated") {
        optionsParts.push("break: true");
      }

      if (doc.id) {
        optionsParts.push(`id: ${printGroupId(doc.id)}`);
      }

      const options =
        optionsParts.length > 0 ? `, { ${optionsParts.join(", ")} }` : "";

      if (doc.expandedStates) {
        return `conditionalGroup([${doc.expandedStates
          .map(printDoc)
          .join(",")}]${options})`;
      }

      return `group(${printDoc(doc.contents)}${options})`;
    }

    if (doc.type === "fill") {
      return `fill([${doc.parts.map(printDoc).join(", ")}])`;
    }

    if (doc.type === "line-suffix") {
      return "lineSuffix(" + printDoc(doc.contents) + ")";
    }

    if (doc.type === "line-suffix-boundary") {
      return "lineSuffixBoundary";
    }

    throw new Error("Unknown doc type " + doc.type);
  }

  function printGroupId(id) {
    if (typeof id !== "symbol") {
      return JSON.stringify(String(id));
    }

    if (id in symbolsToKeysMap) {
      return symbolsToKeysMap[id];
    }

    const prefix = id.description || "symbol";
    for (let counter = 0; ; counter++) {
      const string = prefix + (counter > 0 ? ` #${counter}` : "");
      if (!usedKeysForSymbols.has(string)) {
        usedKeysForSymbols.add(string);
        return (symbolsToKeysMap[id] = `Symbol.for(${JSON.stringify(string)})`);
      }
    }
  }
}

module.exports = { printDocToDebug };
