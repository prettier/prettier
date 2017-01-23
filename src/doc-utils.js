"use strict";
function traverseDocUpDown(doc, onEnter, onExit) {
  if (doc.type === "concat") {
    onEnter(doc);
    for (var i = doc.parts.length - 1; i >= 0; i--) {
      traverseDocUpDown(doc.parts[i], onEnter, onExit);
    }
    onExit(doc);
  } else if (doc.type === "if-break") {
    onEnter(doc);
    if (doc.breakContents) {
      traverseDocUpDown(doc.breakContents, onEnter, onExit);
    }
    if (doc.flatContents) {
      traverseDocUpDown(doc.flatContents, onEnter, onExit);
    }
    onExit(doc);
  } else if (doc.contents) {
    onEnter(doc);
    traverseDocUpDown(doc.contents, onEnter, onExit);
    onExit(doc);
  } else {
    onEnter(doc);
  }
}

function traverseDoc(doc, func) {
  if (doc.type === "concat") {
    func(doc);
    for (var i = 0; i < doc.parts.length; i++) {
      traverseDoc(doc.parts[i], func);
    }
  } else if (doc.type === "if-break") {
    func(doc);
    if (doc.breakContents) {
      traverseDoc(doc.breakContents, func);
    }
    if (doc.flatContents) {
      traverseDoc(doc.flatContents, func);
    }
  } else if (doc.contents) {
    func(doc);
    traverseDoc(doc.contents, func);
  } else {
    func(doc);
  }
}

function isEmpty(n) {
  return typeof n === "string" && n.length === 0;
}

function getFirstString(doc) {
  let firstString = null;
  traverseDoc(doc, doc => {
    if (
      typeof doc === "string" && doc.trim().length !== 0 && firstString === null
    ) {
      firstString = doc;
    }
  });
  return firstString;
}

function isLineNext(doc) {
  let flag = null;
  traverseDoc(doc, doc => {
    if(flag === null) {
      if (typeof doc === "string") {
        flag = false;
      }
      if (doc.type === "line") {
        flag = true;
      }
    }
  });
  return !!flag;
}

function willBreak(doc) {
  let willBreak = false;
  traverseDoc(doc, doc => {
    switch (doc.type) {
      case "group":
        if(doc.break) {
          willBreak = true;
        }
      case "line":
        if (doc.hard) {
          willBreak = true;
        }

        break;
    }
  });
  return willBreak;
}

function breakParentGroup(groupStack) {
  if(groupStack.length > 0) {
    const parentGroup = groupStack[groupStack.length - 1];
    // Breaks are not propagated through conditional groups because
    // the user is expected to manually handle what breaks.
    if(!parentGroup.expandedStates) {
      parentGroup.break = true;
    }
  }
  return null;
}

function propagateBreaks(doc) {
  const groupStack = [];
  traverseDocUpDown(
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
        if(group.break) {
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
  traverseDocUpDown,
  propagateBreaks
};
