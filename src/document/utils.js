import { join, literalline } from "./builders.js";
import {
  DOC_TYPE_ALIGN,
  DOC_TYPE_ARRAY,
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
  DOC_TYPE_STRING,
  DOC_TYPE_TRIM,
} from "./constants.js";
import InvalidDocError from "./invalid-doc-error.js";
import getDocType from "./utils/get-doc-type.js";
import traverseDoc from "./utils/traverse-doc.js";

function mapDoc(doc, cb) {
  // Avoid creating `Map`
  if (typeof doc === "string") {
    return cb(doc);
  }

  // Within a doc tree, the same subtrees can be found multiple times.
  // E.g., often this happens in conditional groups.
  // As an optimization (those subtrees can be huge) and to maintain the
  // reference structure of the tree, the mapping results are cached in
  // a map and reused.
  const mapped = new Map();

  return rec(doc);

  function rec(doc) {
    if (mapped.has(doc)) {
      return mapped.get(doc);
    }
    const result = process(doc);
    mapped.set(doc, result);
    return result;
  }

  function process(doc) {
    switch (getDocType(doc)) {
      case DOC_TYPE_ARRAY:
        return cb(doc.map(rec));

      case DOC_TYPE_FILL:
        return cb({ ...doc, parts: doc.parts.map(rec) });

      case DOC_TYPE_IF_BREAK:
        return cb({
          ...doc,
          breakContents: rec(doc.breakContents),
          flatContents: rec(doc.flatContents),
        });

      case DOC_TYPE_GROUP: {
        let { expandedStates, contents } = doc;
        if (expandedStates) {
          expandedStates = expandedStates.map(rec);
          contents = expandedStates[0];
        } else {
          contents = rec(contents);
        }
        return cb({ ...doc, contents, expandedStates });
      }

      case DOC_TYPE_ALIGN:
      case DOC_TYPE_INDENT:
      case DOC_TYPE_INDENT_IF_BREAK:
      case DOC_TYPE_LABEL:
      case DOC_TYPE_LINE_SUFFIX:
        return cb({ ...doc, contents: rec(doc.contents) });

      case DOC_TYPE_STRING:
      case DOC_TYPE_CURSOR:
      case DOC_TYPE_TRIM:
      case DOC_TYPE_LINE_SUFFIX_BOUNDARY:
      case DOC_TYPE_LINE:
      case DOC_TYPE_BREAK_PARENT:
        return cb(doc);

      default:
        /* c8 ignore next 3 */
        throw new InvalidDocError(doc);
    }
  }
}

function findInDoc(doc, fn, defaultValue) {
  let result = defaultValue;
  let shouldSkipFurtherProcessing = false;
  function findInDocOnEnterFn(doc) {
    if (shouldSkipFurtherProcessing) {
      return false;
    }

    const maybeResult = fn(doc);
    if (maybeResult !== undefined) {
      shouldSkipFurtherProcessing = true;
      result = maybeResult;
    }
  }
  traverseDoc(doc, findInDocOnEnterFn);
  return result;
}

function willBreakFn(doc) {
  if (doc.type === DOC_TYPE_GROUP && doc.break) {
    return true;
  }
  if (doc.type === DOC_TYPE_LINE && doc.hard) {
    return true;
  }
  if (doc.type === DOC_TYPE_BREAK_PARENT) {
    return true;
  }
}

function willBreak(doc) {
  return findInDoc(doc, willBreakFn, false);
}

function breakParentGroup(groupStack) {
  if (groupStack.length > 0) {
    const parentGroup = groupStack.at(-1);
    // Breaks are not propagated through conditional groups because
    // the user is expected to manually handle what breaks.
    if (!parentGroup.expandedStates && !parentGroup.break) {
      // An alternative truthy value allows to distinguish propagated group breaks
      // and not to print them as `group(..., { break: true })` in `--debug-print-doc`.
      parentGroup.break = "propagated";
    }
  }
  return null;
}

function propagateBreaks(doc) {
  const alreadyVisitedSet = new Set();
  const groupStack = [];
  function propagateBreaksOnEnterFn(doc) {
    if (doc.type === DOC_TYPE_BREAK_PARENT) {
      breakParentGroup(groupStack);
    }
    if (doc.type === DOC_TYPE_GROUP) {
      groupStack.push(doc);
      if (alreadyVisitedSet.has(doc)) {
        return false;
      }
      alreadyVisitedSet.add(doc);
    }
  }
  function propagateBreaksOnExitFn(doc) {
    if (doc.type === DOC_TYPE_GROUP) {
      const group = groupStack.pop();
      if (group.break) {
        breakParentGroup(groupStack);
      }
    }
  }
  traverseDoc(
    doc,
    propagateBreaksOnEnterFn,
    propagateBreaksOnExitFn,
    /* shouldTraverseConditionalGroups */ true,
  );
}

function removeLinesFn(doc) {
  // Force this doc into flat mode by statically converting all
  // lines into spaces (or soft lines into nothing). Hard lines
  // should still output because there's too great of a chance
  // of breaking existing assumptions otherwise.
  if (doc.type === DOC_TYPE_LINE && !doc.hard) {
    return doc.soft ? "" : " ";
  }

  if (doc.type === DOC_TYPE_IF_BREAK) {
    return doc.flatContents;
  }

  return doc;
}

function removeLines(doc) {
  return mapDoc(doc, removeLinesFn);
}

function stripTrailingHardlineFromParts(parts) {
  parts = [...parts];

  while (
    parts.length >= 2 &&
    parts.at(-2).type === DOC_TYPE_LINE &&
    parts.at(-1).type === DOC_TYPE_BREAK_PARENT
  ) {
    parts.length -= 2;
  }

  if (parts.length > 0) {
    const lastPart = stripTrailingHardlineFromDoc(parts.at(-1));
    parts[parts.length - 1] = lastPart;
  }

  return parts;
}

function stripTrailingHardlineFromDoc(doc) {
  switch (getDocType(doc)) {
    case DOC_TYPE_INDENT:
    case DOC_TYPE_INDENT_IF_BREAK:
    case DOC_TYPE_GROUP:
    case DOC_TYPE_LINE_SUFFIX:
    case DOC_TYPE_LABEL: {
      const contents = stripTrailingHardlineFromDoc(doc.contents);
      return { ...doc, contents };
    }

    case DOC_TYPE_IF_BREAK:
      return {
        ...doc,
        breakContents: stripTrailingHardlineFromDoc(doc.breakContents),
        flatContents: stripTrailingHardlineFromDoc(doc.flatContents),
      };

    case DOC_TYPE_FILL:
      return { ...doc, parts: stripTrailingHardlineFromParts(doc.parts) };

    case DOC_TYPE_ARRAY:
      return stripTrailingHardlineFromParts(doc);

    case DOC_TYPE_STRING:
      return doc.replace(/[\n\r]*$/, "");

    case DOC_TYPE_ALIGN:
    case DOC_TYPE_CURSOR:
    case DOC_TYPE_TRIM:
    case DOC_TYPE_LINE_SUFFIX_BOUNDARY:
    case DOC_TYPE_LINE:
    case DOC_TYPE_BREAK_PARENT:
      // No op
      break;

    default:
      throw new InvalidDocError(doc);
  }

  return doc;
}

function stripTrailingHardline(doc) {
  // HACK remove ending hardline, original PR: #1984
  return stripTrailingHardlineFromDoc(cleanDoc(doc));
}

function cleanDocFn(doc) {
  switch (getDocType(doc)) {
    case DOC_TYPE_FILL:
      if (doc.parts.every((part) => part === "")) {
        return "";
      }
      break;
    case DOC_TYPE_GROUP:
      if (!doc.contents && !doc.id && !doc.break && !doc.expandedStates) {
        return "";
      }
      // Remove nested only group
      if (
        doc.contents.type === DOC_TYPE_GROUP &&
        doc.contents.id === doc.id &&
        doc.contents.break === doc.break &&
        doc.contents.expandedStates === doc.expandedStates
      ) {
        return doc.contents;
      }
      break;
    case DOC_TYPE_ALIGN:
    case DOC_TYPE_INDENT:
    case DOC_TYPE_INDENT_IF_BREAK:
    case DOC_TYPE_LINE_SUFFIX:
      if (!doc.contents) {
        return "";
      }
      break;
    case DOC_TYPE_IF_BREAK:
      if (!doc.flatContents && !doc.breakContents) {
        return "";
      }
      break;
    case DOC_TYPE_ARRAY: {
      // Flat array, concat strings
      const parts = [];
      for (const part of doc) {
        if (!part) {
          continue;
        }
        const [currentPart, ...restParts] = Array.isArray(part) ? part : [part];
        if (
          typeof currentPart === "string" &&
          typeof parts.at(-1) === "string"
        ) {
          parts[parts.length - 1] += currentPart;
        } else {
          parts.push(currentPart);
        }
        parts.push(...restParts);
      }

      if (parts.length === 0) {
        return "";
      }

      if (parts.length === 1) {
        return parts[0];
      }

      return parts;
    }
    case DOC_TYPE_STRING:
    case DOC_TYPE_CURSOR:
    case DOC_TYPE_TRIM:
    case DOC_TYPE_LINE_SUFFIX_BOUNDARY:
    case DOC_TYPE_LINE:
    case DOC_TYPE_LABEL:
    case DOC_TYPE_BREAK_PARENT:
      // No op
      break;
    default:
      /* c8 ignore next 3 */
      throw new InvalidDocError(doc);
  }

  return doc;
}

// - concat strings
// - flat arrays except for parts of `fill`
// - merge arrays of strings into single strings
// - remove nested `group`s and empty `fill`/`align`/`indent`/`line-suffix`/`if-break` if possible
function cleanDoc(doc) {
  return mapDoc(doc, (currentDoc) => cleanDocFn(currentDoc));
}

function normalizeParts(parts) {
  const newParts = [];

  const restParts = parts.filter(Boolean);
  while (restParts.length > 0) {
    const part = restParts.shift();

    if (!part) {
      continue;
    }

    if (Array.isArray(part)) {
      restParts.unshift(...part);
      continue;
    }

    if (
      newParts.length > 0 &&
      typeof newParts.at(-1) === "string" &&
      typeof part === "string"
    ) {
      newParts[newParts.length - 1] += part;
      continue;
    }

    newParts.push(part);
  }

  return newParts;
}

function replaceEndOfLine(doc, replacement = literalline) {
  return mapDoc(doc, (currentDoc) =>
    typeof currentDoc === "string"
      ? join(replacement, currentDoc.split("\n"))
      : currentDoc,
  );
}

function canBreakFn(doc) {
  if (doc.type === DOC_TYPE_LINE) {
    return true;
  }
}

function canBreak(doc) {
  return findInDoc(doc, canBreakFn, false);
}

function inheritLabel(doc, fn) {
  return doc.type === DOC_TYPE_LABEL
    ? { ...doc, contents: fn(doc.contents) }
    : fn(doc);
}

export {
  canBreak,
  cleanDoc,
  findInDoc,
  getDocType,
  inheritLabel,
  mapDoc,
  normalizeParts,
  propagateBreaks,
  removeLines,
  replaceEndOfLine,
  stripTrailingHardline,
  traverseDoc,
  willBreak,
};
