import { getLast } from "../utils/index.js";
import {
  DOC_TYPE_STRING,
  DOC_TYPE_ARRAY,
  DOC_TYPE_INDENT,
  DOC_TYPE_ALIGN,
  DOC_TYPE_GROUP,
  DOC_TYPE_FILL,
  DOC_TYPE_IF_BREAK,
  DOC_TYPE_INDENT_IF_BREAK,
  DOC_TYPE_LINE_SUFFIX,
  DOC_TYPE_LINE,
  DOC_TYPE_LABEL,
  DOC_TYPE_BREAK_PARENT,
} from "./constants.js";
import { literalline, join } from "./builders.js";

const getDocParts = (doc) => {
  if (Array.isArray(doc)) {
    return doc;
  }

  /* istanbul ignore next */
  if (doc.type !== DOC_TYPE_FILL) {
    throw new Error(`Expect doc to be 'array' or '${DOC_TYPE_FILL}'.`);
  }

  return doc.parts;
};

// Using a unique object to compare by reference.
const traverseDocOnExitStackMarker = {};

function traverseDoc(doc, onEnter, onExit, shouldTraverseConditionalGroups) {
  const docsStack = [doc];

  while (docsStack.length > 0) {
    const doc = docsStack.pop();

    if (doc === traverseDocOnExitStackMarker) {
      onExit(docsStack.pop());
      continue;
    }

    if (onExit) {
      docsStack.push(doc, traverseDocOnExitStackMarker);
    }

    if (
      // Should Recurse
      !onEnter ||
      onEnter(doc) !== false
    ) {
      // When there are multiple parts to process,
      // the parts need to be pushed onto the stack in reverse order,
      // so that they are processed in the original order
      // when the stack is popped.
      if (Array.isArray(doc) || doc.type === DOC_TYPE_FILL) {
        const parts = getDocParts(doc);
        for (let ic = parts.length, i = ic - 1; i >= 0; --i) {
          docsStack.push(parts[i]);
        }
      } else if (doc.type === DOC_TYPE_IF_BREAK) {
        if (doc.flatContents) {
          docsStack.push(doc.flatContents);
        }
        if (doc.breakContents) {
          docsStack.push(doc.breakContents);
        }
      } else if (doc.type === DOC_TYPE_GROUP && doc.expandedStates) {
        if (shouldTraverseConditionalGroups) {
          for (let ic = doc.expandedStates.length, i = ic - 1; i >= 0; --i) {
            docsStack.push(doc.expandedStates[i]);
          }
        } else {
          docsStack.push(doc.contents);
        }
      } else if (doc.contents) {
        docsStack.push(doc.contents);
      }
    }
  }
}

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
      case DOC_TYPE_IF_BREAK: {
        const breakContents = doc.breakContents && rec(doc.breakContents);
        const flatContents = doc.flatContents && rec(doc.flatContents);
        return cb({ ...doc, breakContents, flatContents });
      }
      case DOC_TYPE_GROUP: {
        if (doc.expandedStates) {
          const expandedStates = doc.expandedStates.map(rec);
          const contents = expandedStates[0];
          return cb({ ...doc, contents, expandedStates });
        }

        break;
      }
    }

    if (doc.contents) {
      const contents = rec(doc.contents);
      return cb({ ...doc, contents });
    }

    return cb(doc);
  }
}

function findInDoc(doc, fn, defaultValue) {
  let result = defaultValue;
  let hasStopped = false;
  function findInDocOnEnterFn(doc) {
    const maybeResult = fn(doc);
    if (maybeResult !== undefined) {
      hasStopped = true;
      result = maybeResult;
    }
    if (hasStopped) {
      return false;
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
    const parentGroup = getLast(groupStack);
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
    /* shouldTraverseConditionalGroups */ true
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
    return doc.flatContents || "";
  }

  return doc;
}

function removeLines(doc) {
  return mapDoc(doc, removeLinesFn);
}

const isHardline = (doc, nextDoc) =>
  doc &&
  doc.type === DOC_TYPE_LINE &&
  doc.hard &&
  nextDoc &&
  nextDoc.type === DOC_TYPE_BREAK_PARENT;
function stripDocTrailingHardlineFromDoc(doc) {
  if (!doc) {
    return doc;
  }

  if (Array.isArray(doc) || doc.type === DOC_TYPE_FILL) {
    const parts = getDocParts(doc);

    while (parts.length > 1 && isHardline(...parts.slice(-2))) {
      parts.length -= 2;
    }

    if (parts.length > 0) {
      const lastPart = stripDocTrailingHardlineFromDoc(getLast(parts));
      parts[parts.length - 1] = lastPart;
    }
    return Array.isArray(doc) ? parts : { ...doc, parts };
  }

  switch (doc.type) {
    case DOC_TYPE_ALIGN:
    case DOC_TYPE_INDENT:
    case DOC_TYPE_INDENT_IF_BREAK:
    case DOC_TYPE_GROUP:
    case DOC_TYPE_LINE_SUFFIX:
    case DOC_TYPE_LABEL: {
      const contents = stripDocTrailingHardlineFromDoc(doc.contents);
      return { ...doc, contents };
    }
    case DOC_TYPE_IF_BREAK: {
      const breakContents = stripDocTrailingHardlineFromDoc(doc.breakContents);
      const flatContents = stripDocTrailingHardlineFromDoc(doc.flatContents);
      return { ...doc, breakContents, flatContents };
    }
  }

  return doc;
}

function stripTrailingHardline(doc) {
  if (typeof doc === "string") {
    return doc.replace(/(?:\r?\n)*$/, "");
  }

  // HACK remove ending hardline, original PR: #1984
  return stripDocTrailingHardlineFromDoc(cleanDoc(doc));
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
          typeof getLast(parts) === "string"
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
  }

  return doc;
}
// A safer version of `normalizeDoc`
// - `normalizeDoc` concat strings and flat array in `fill`, while `cleanDoc` don't
// - On array, `normalizeDoc` always return object with `parts`, `cleanDoc` may return strings
// - `cleanDoc` also remove nested `group`s and empty `fill`/`align`/`indent`/`line-suffix`/`if-break` if possible
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
      typeof getLast(newParts) === "string" &&
      typeof part === "string"
    ) {
      newParts[newParts.length - 1] += part;
      continue;
    }

    newParts.push(part);
  }

  return newParts;
}

function normalizeDoc(doc) {
  return mapDoc(doc, (currentDoc) => {
    if (Array.isArray(currentDoc)) {
      return normalizeParts(currentDoc);
    }
    if (!currentDoc.parts) {
      return currentDoc;
    }
    return {
      ...currentDoc,
      parts: normalizeParts(currentDoc.parts),
    };
  });
}

function replaceEndOfLine(doc) {
  return mapDoc(doc, (currentDoc) =>
    typeof currentDoc === "string" && currentDoc.includes("\n")
      ? replaceTextEndOfLine(currentDoc)
      : currentDoc
  );
}

function replaceTextEndOfLine(text, replacement = literalline) {
  return join(replacement, text.split("\n"));
}

function canBreakFn(doc) {
  if (doc.type === DOC_TYPE_LINE) {
    return true;
  }
}

function canBreak(doc) {
  return findInDoc(doc, canBreakFn, false);
}

function getDocType(doc) {
  if (typeof doc === "string") {
    return DOC_TYPE_STRING;
  }

  if (Array.isArray(doc)) {
    return DOC_TYPE_ARRAY;
  }

  return doc?.type;
}

export {
  getDocParts,
  willBreak,
  traverseDoc,
  findInDoc,
  mapDoc,
  propagateBreaks,
  removeLines,
  stripTrailingHardline,
  normalizeParts,
  normalizeDoc,
  cleanDoc,
  replaceTextEndOfLine,
  replaceEndOfLine,
  canBreak,
  getDocType,
};
