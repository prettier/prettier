"use strict";

const { literalline, concat } = require("./doc-builders");

// Using a unique object to compare by reference.
const traverseDocOnExitStackMarker = {};

function traverseDoc(doc, onEnter, onExit, shouldTraverseConditionalGroups) {
  const docsStack = [doc];

  while (docsStack.length !== 0) {
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
      if (doc.type === "concat" || doc.type === "fill") {
        for (let ic = doc.parts.length, i = ic - 1; i >= 0; --i) {
          docsStack.push(doc.parts[i]);
        }
      } else if (doc.type === "if-break") {
        if (doc.flatContents) {
          docsStack.push(doc.flatContents);
        }
        if (doc.breakContents) {
          docsStack.push(doc.breakContents);
        }
      } else if (doc.type === "group" && doc.expandedStates) {
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
  if (doc.type === "concat" || doc.type === "fill") {
    const parts = doc.parts.map((part) => mapDoc(part, cb));
    return cb({ ...doc, parts });
  } else if (doc.type === "if-break") {
    const breakContents = doc.breakContents && mapDoc(doc.breakContents, cb);
    const flatContents = doc.flatContents && mapDoc(doc.flatContents, cb);
    return cb({ ...doc, breakContents, flatContents });
  } else if (doc.contents) {
    const contents = mapDoc(doc.contents, cb);
    return cb({ ...doc, contents });
  }
  return cb(doc);
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

function isEmpty(n) {
  return typeof n === "string" && n.length === 0;
}

function isLineNextFn(doc) {
  if (typeof doc === "string") {
    return false;
  }
  if (doc.type === "line") {
    return true;
  }
}

function isLineNext(doc) {
  return findInDoc(doc, isLineNextFn, false);
}

function willBreakFn(doc) {
  if (doc.type === "group" && doc.break) {
    return true;
  }
  if (doc.type === "line" && doc.hard) {
    return true;
  }
  if (doc.type === "break-parent") {
    return true;
  }
}

function willBreak(doc) {
  return findInDoc(doc, willBreakFn, false);
}

function breakParentGroup(groupStack) {
  if (groupStack.length > 0) {
    const parentGroup = groupStack[groupStack.length - 1];
    // Breaks are not propagated through conditional groups because
    // the user is expected to manually handle what breaks.
    if (!parentGroup.expandedStates) {
      parentGroup.break = true;
    }
  }
  return null;
}

function propagateBreaks(doc) {
  const alreadyVisitedSet = new Set();
  const groupStack = [];
  function propagateBreaksOnEnterFn(doc) {
    if (doc.type === "break-parent") {
      breakParentGroup(groupStack);
    }
    if (doc.type === "group") {
      groupStack.push(doc);
      if (alreadyVisitedSet.has(doc)) {
        return false;
      }
      alreadyVisitedSet.add(doc);
    }
  }
  function propagateBreaksOnExitFn(doc) {
    if (doc.type === "group") {
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
  if (doc.type === "line" && !doc.hard) {
    return doc.soft ? "" : " ";
  } else if (doc.type === "if-break") {
    return doc.flatContents || "";
  }
  return doc;
}

function removeLines(doc) {
  return mapDoc(doc, removeLinesFn);
}

const isHardline = (doc, nextDoc) =>
  doc &&
  doc.type === "line" &&
  doc.hard &&
  nextDoc &&
  nextDoc.type === "break-parent";
function stripDocTrailingHardlineFromDoc(doc) {
  if (!doc) {
    return doc;
  }

  switch (doc.type) {
    case "concat":
    case "fill": {
      const { parts } = doc;

      while (parts.length > 1 && isHardline(...parts.slice(-2))) {
        parts.length -= 2;
      }

      if (parts.length > 0) {
        const lastPart = stripDocTrailingHardlineFromDoc(
          parts[parts.length - 1]
        );
        parts[parts.length - 1] = lastPart;
      }
      break;
    }
    case "align":
    case "indent":
    case "group":
    case "line-suffix":
      doc.contents = stripDocTrailingHardlineFromDoc(doc.contents);
      break;
    case "if-break":
      doc.breakContents = stripDocTrailingHardlineFromDoc(doc.breakContents);
      doc.flatContents = stripDocTrailingHardlineFromDoc(doc.flatContents);
      break;
  }

  return doc;
}

function stripTrailingHardline(doc) {
  // HACK remove ending hardline, original PR: #1984
  return stripDocTrailingHardlineFromDoc(cleanDoc(doc));
}

const isConcat = (doc) => doc && doc.type === "concat";
function cleanDocFn(doc) {
  switch (doc.type) {
    case "fill":
      if (doc.parts.length === 0 || doc.parts.every((part) => part === "")) {
        return "";
      }
      if (doc.parts.length === 1) {
        return doc.parts[0];
      }
      break;
    case "group":
      // Remove nested only group
      if (
        doc.contents.type === "group" &&
        doc.contents.id === doc.id &&
        doc.contents.break === doc.break &&
        doc.contents.expandedStates === doc.expandedStates
      ) {
        return doc.contents;
      }
      break;
    case "align":
    case "indent":
    case "line-suffix":
      if (!doc.contents) {
        return "";
      }
      break;
    case "if-break":
      if (!doc.flatContents && !doc.breakContents) {
        return "";
      }
      break;
  }

  if (!isConcat(doc)) {
    return doc;
  }

  const { parts } = doc;
  for (let index = parts.length - 1; index >= 0; index--) {
    const currentPart = parts[index];
    const nextPart = parts[index + 1];
    // Flat `concat`
    if (isConcat(currentPart)) {
      const { parts: currentPartParts } = currentPart;
      // `currentPart` already cleaned, only need concat the last string with next string
      if (
        typeof nextPart === "string" &&
        typeof currentPartParts[currentPartParts.length - 1] === "string"
      ) {
        currentPartParts[currentPartParts.length - 1] += nextPart;
        parts.splice(index, 2, ...currentPartParts);
      } else {
        parts.splice(index, 1, ...currentPartParts);
      }
    } else if (typeof currentPart === "string") {
      // If empty string, remove it
      if (currentPart === "") {
        parts.splice(index, 1);
      }
      // Concat continuous string
      else if (typeof nextPart === "string") {
        parts.splice(index, 2, currentPart + nextPart);
      }
    }
  }

  if (parts.length === 0) {
    return "";
  }

  if (parts.length === 1) {
    return parts[0];
  }
  return doc;
}
function cleanDoc(doc) {
  return mapDoc(doc, (currentDoc) => cleanDocFn(currentDoc));
}

function normalizeParts(parts) {
  const newParts = [];

  const restParts = parts.filter(Boolean);
  while (restParts.length !== 0) {
    const part = restParts.shift();

    if (!part) {
      continue;
    }

    if (part.type === "concat") {
      restParts.unshift(...part.parts);
      continue;
    }

    if (
      newParts.length !== 0 &&
      typeof newParts[newParts.length - 1] === "string" &&
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
    if (!currentDoc.parts) {
      return currentDoc;
    }
    return {
      ...currentDoc,
      parts: normalizeParts(currentDoc.parts),
    };
  });
}

function replaceNewlinesWithLiterallines(doc) {
  return mapDoc(doc, (currentDoc) =>
    typeof currentDoc === "string" && currentDoc.includes("\n")
      ? concat(
          currentDoc
            .split(/(\n)/g)
            .map((v, i) => (i % 2 === 0 ? v : literalline))
        )
      : currentDoc
  );
}

module.exports = {
  isEmpty,
  willBreak,
  isLineNext,
  traverseDoc,
  findInDoc,
  mapDoc,
  propagateBreaks,
  removeLines,
  stripTrailingHardline,
  normalizeParts,
  normalizeDoc,
  cleanDoc,
  replaceNewlinesWithLiterallines,
};
