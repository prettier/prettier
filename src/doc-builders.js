"use strict";
const utils = require("./doc-utils");
const willBreak = utils.willBreak;

function assertDoc(val) {
  if (!(typeof val === "string" || val != null && typeof val.type === "string")) {
    throw new Error("Value " + JSON.stringify(val) + " is not a valid document");
  }
}

function concat(parts) {
  parts.forEach(assertDoc);

  return { type: "concat", parts };
}

function indent(n, contents) {
  assertDoc(contents);

  return { type: "indent", contents, n };
}

function group(contents, opts) {
  opts = opts || {};

  assertDoc(contents);

  return {
    type: "group",
    contents: contents,
    break: !!opts.shouldBreak,
    expandedStates: opts.expandedStates
  };
}

function conditionalGroup(states, opts) {
  return group(
    states[0],
    Object.assign(opts || {}, { expandedStates: states })
  );
}

function ifBreak(breakContents, flatContents) {
  if (breakContents) {
    assertDoc(breakContents);
  }
  if (flatContents) {
    assertDoc(flatContents);
  }

  return { type: "if-break", breakContents, flatContents };
}

const breakParent =  { type: "break-parent" };
const line = { type: "line" };
const softline = { type: "line", soft: true };
const hardline = concat([{ type: "line", hard: true }, breakParent ]);
const literalline = concat([{ type: "line", hard: true, literal: true }, breakParent ]);

function join(sep, arr) {
  var res = [];

  for (var i = 0; i < arr.length; i++) {
    if (i !== 0) {
      res.push(sep);
    }

    res.push(arr[i]);
  }

  return concat(res);
}

module.exports = {
  concat,
  join,
  line,
  softline,
  hardline,
  literalline,
  group,
  conditionalGroup,
  breakParent,
  ifBreak,
  indent
};
