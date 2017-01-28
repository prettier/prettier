"use strict";

function traverseDoc(doc, onEnter, onExit) {
  var hasStopped = false;
  function traverseDocRec(doc) {
    if (onEnter) {
      hasStopped = hasStopped || onEnter(doc) === false;
    }
    if (hasStopped) {
      return;
    }

    if (doc.type === "concat") {
      for (var i = 0; i < doc.parts.length; i++) {
        traverseDocRec(doc.parts[i]);
      }
    } else if (doc.type === "if-break") {
      if (doc.breakContents) {
        traverseDocRec(doc.breakContents);
      }
      if (doc.flatContents) {
        traverseDocRec(doc.flatContents);
      }
    } else if (doc.contents) {
      traverseDocRec(doc.contents);
    }

    if (onExit) {
      onExit(doc);
    }
  }

  traverseDocRec(doc);
}

function findInDoc(doc, fn, defaultValue) {
  var result = defaultValue;
  traverseDoc(doc, function(doc) {
    var maybeResult = fn(doc);
    if (maybeResult !== undefined) {
      result = maybeResult;
      return false;
    }
  });
  return result;
}

function isEmpty(n) {
  return typeof n === "string" && n.length === 0;
}

function getFirstString(doc) {
  return findInDoc(
    doc,
    doc => {
      if (typeof doc === "string" && doc.trim().length !== 0) {
        return doc;
      }
    },
    null
  );
}

function isLineNext(doc) {
  return findInDoc(
    doc,
    doc => {
      if (typeof doc === "string") {
        return false;
      }
      if (doc.type === "line") {
        return true;
      }
    },
    false
  );
}

function willBreak(doc) {
  return findInDoc(
    doc,
    doc => {
      if (doc.type === "group" && doc.break) {
        return true;
      }
      if (doc.type === "line" && doc.hard) {
        return true;
      }
    },
    false
  );
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
  const groupStack = [];
  traverseDoc(
    doc,
    doc => {
      if (doc.type === "break-parent") {
        breakParentGroup(groupStack);
      }
      if (doc.type === "group") {
        groupStack.push(doc);
      }
    },
    doc => {
      if (doc.type === "group") {
        const group = groupStack.pop();
        if (group.break) {
          breakParentGroup(groupStack);
        }
      }
    }
  );
}

module.exports = {
  isEmpty,
  getFirstString,
  willBreak,
  isLineNext,
  traverseDoc,
  propagateBreaks
};
