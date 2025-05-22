import {
  DOC_TYPE_ALIGN,
  DOC_TYPE_BREAK_PARENT,
  DOC_TYPE_CURSOR,
  DOC_TYPE_FILL,
  DOC_TYPE_GROUP,
  DOC_TYPE_IF_BREAK,
  DOC_TYPE_INDENT,
  DOC_TYPE_INDENT_IF_BREAK,
  DOC_TYPE_LABEL,
  DOC_TYPE_LINE,
  DOC_TYPE_LINE_SUFFIX,
  DOC_TYPE_LINE_SUFFIX_BOUNDARY,
  DOC_TYPE_TRIM,
} from "./constants.js";

function flattenDoc(doc) {
  if (!doc) {
    return "";
  }

  if (Array.isArray(doc)) {
    const res = [];
    for (const part of doc) {
      if (Array.isArray(part)) {
        res.push(...flattenDoc(part));
      } else {
        const flattened = flattenDoc(part);
        if (flattened !== "") {
          res.push(flattened);
        }
      }
    }

    return res;
  }

  if (doc.type === DOC_TYPE_IF_BREAK) {
    return {
      ...doc,
      breakContents: flattenDoc(doc.breakContents),
      flatContents: flattenDoc(doc.flatContents),
    };
  }

  if (doc.type === DOC_TYPE_GROUP) {
    return {
      ...doc,
      contents: flattenDoc(doc.contents),
      expandedStates: doc.expandedStates?.map(flattenDoc),
    };
  }

  if (doc.type === DOC_TYPE_FILL) {
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

    if (Array.isArray(doc)) {
      const printed = doc.map(printDoc).filter(Boolean);
      return printed.length === 1 ? printed[0] : `[${printed.join(", ")}]`;
    }

    if (doc.type === DOC_TYPE_LINE) {
      const withBreakParent =
        parentParts?.[index + 1]?.type === DOC_TYPE_BREAK_PARENT;
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

    if (doc.type === DOC_TYPE_BREAK_PARENT) {
      const afterHardline =
        parentParts?.[index - 1]?.type === DOC_TYPE_LINE &&
        parentParts[index - 1].hard;
      return afterHardline ? undefined : "breakParent";
    }

    if (doc.type === DOC_TYPE_TRIM) {
      return "trim";
    }

    if (doc.type === DOC_TYPE_INDENT) {
      return "indent(" + printDoc(doc.contents) + ")";
    }

    if (doc.type === DOC_TYPE_ALIGN) {
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

    if (doc.type === DOC_TYPE_IF_BREAK) {
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

    if (doc.type === DOC_TYPE_INDENT_IF_BREAK) {
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

    if (doc.type === DOC_TYPE_GROUP) {
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

    if (doc.type === DOC_TYPE_FILL) {
      return `fill([${doc.parts.map((part) => printDoc(part)).join(", ")}])`;
    }

    if (doc.type === DOC_TYPE_LINE_SUFFIX) {
      return "lineSuffix(" + printDoc(doc.contents) + ")";
    }

    if (doc.type === DOC_TYPE_LINE_SUFFIX_BOUNDARY) {
      return "lineSuffixBoundary";
    }

    if (doc.type === DOC_TYPE_LABEL) {
      return `label(${JSON.stringify(doc.label)}, ${printDoc(doc.contents)})`;
    }

    if (doc.type === DOC_TYPE_CURSOR) {
      return "cursor";
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

    const prefix = id.description || "symbol";
    for (let counter = 0; ; counter++) {
      const key = prefix + (counter > 0 ? ` #${counter}` : "");
      if (!usedKeysForSymbols.has(key)) {
        usedKeysForSymbols.add(key);
        return (printedSymbols[id] = `Symbol.for(${JSON.stringify(key)})`);
      }
    }
  }
}

export { printDocToDebug };
