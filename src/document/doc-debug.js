"use strict";

const { isConcat, getDocParts } = require("./doc-utils");

function flattenDoc(doc) {
  if (!doc) {
    return "";
  }

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
  }

  if (doc.type === "if-break") {
    return {
      ...doc,
      breakContents: flattenDoc(doc.breakContents),
      flatContents: flattenDoc(doc.flatContents),
    };
  }

  if (doc.type === "group") {
    return {
      ...doc,
      contents: flattenDoc(doc.contents),
      expandedStates: doc.expandedStates && doc.expandedStates.map(flattenDoc),
    };
  }

  if (doc.type === "fill") {
    return { type: "fill", parts: doc.parts.map(flattenDoc) };
  }

  if (doc.contents) {
    return { ...doc, contents: flattenDoc(doc.contents) };
  }

  return doc;
}

function printDocToDebug(doc) {
  /** @type Record<symbol, string> */
  const printedSymbols = Object.create(null);
  /** @type Set<string> */
  const usedKeysForSymbols = new Set();
  return printDoc(flattenDoc(doc));

  function printDoc(doc, index, parentParts) {
    if (typeof doc === "string") {
      return JSON.stringify(doc);
    }

    if (isConcat(doc)) {
      const printed = getDocParts(doc).map(printDoc).filter(Boolean);
      return printed.length === 1 ? printed[0] : `[${printed.join(", ")}]`;
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

    if (doc.type === "indent-if-break") {
      const optionsParts = [];

      if (doc.negate) {
        optionsParts.push("negate: true");
      }

      if (doc.groupId) {
        optionsParts.push(`groupId: ${printGroupId(doc.groupId)}`);
      }

      const options =
        optionsParts.length > 0 ? `, { ${optionsParts.join(", ")} }` : "";

      return `indentIfBreak(${printDoc(doc.contents)}${options})`;
    }

    if (doc.type === "group") {
      const optionsParts = [];

      if (doc.break && doc.break !== "propagated") {
        optionsParts.push("shouldBreak: true");
      }

      if (doc.id) {
        optionsParts.push(`id: ${printGroupId(doc.id)}`);
      }

      const options =
        optionsParts.length > 0 ? `, { ${optionsParts.join(", ")} }` : "";

      if (doc.expandedStates) {
        return `conditionalGroup([${doc.expandedStates
          .map((part) => printDoc(part))
          .join(",")}]${options})`;
      }

      return `group(${printDoc(doc.contents)}${options})`;
    }

    if (doc.type === "fill") {
      return `fill([${doc.parts.map((part) => printDoc(part)).join(", ")}])`;
    }

    if (doc.type === "line-suffix") {
      return "lineSuffix(" + printDoc(doc.contents) + ")";
    }

    if (doc.type === "line-suffix-boundary") {
      return "lineSuffixBoundary";
    }

    if (doc.type === "label") {
      return `label(${JSON.stringify(doc.label)}, ${printDoc(doc.contents)})`;
    }

    throw new Error("Unknown doc type " + doc.type);
  }

  function printGroupId(id) {
    if (typeof id !== "symbol") {
      return JSON.stringify(String(id));
    }

    if (id in printedSymbols) {
      return printedSymbols[id];
    }

    // TODO: use Symbol.prototype.description instead of slice once Node 10 is dropped
    const prefix = String(id).slice(7, -1) || "symbol";
    for (let counter = 0; ; counter++) {
      const key = prefix + (counter > 0 ? ` #${counter}` : "");
      if (!usedKeysForSymbols.has(key)) {
        usedKeysForSymbols.add(key);
        return (printedSymbols[id] = `Symbol.for(${JSON.stringify(key)})`);
      }
    }
  }
}

module.exports = { printDocToDebug };
