"use strict";

const assert = require("assert");
const utils = require("./doc-utils");
const hasHardLine = utils.hasHardLine;

function assertDoc(val) {
  assert(
    typeof val === "string" || val != null && typeof val.type === "string",
    "Value is a valid document"
  );
}

function fromString(text) {
  return "" + text;
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

function multilineGroup(contents, opts) {
  return group(
    contents,
    Object.assign(opts || {}, { shouldBreak: hasHardLine(contents) })
  );
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

const line = { type: "line" };
const softline = { type: "line", soft: true };
const hardline = { type: "line", hard: true };
const literalline = { type: "line", hard: true, literal: true };

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
  fromString,
  concat,
  join,
  line,
  softline,
  hardline,
  literalline,
  group,
  multilineGroup,
  conditionalGroup,
  ifBreak,
  indent,
};
