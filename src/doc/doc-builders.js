/** @flow */

"use strict";

/*::
import type { Doc, DocAlignment, GroupDocOptions, GroupDocId } from "./types";
*/

function assertDoc(val /*: Doc */) {
  /* istanbul ignore if */
  if (
    !(typeof val === "string" || (val != null && typeof val.type === "string"))
  ) {
    throw new Error(
      "Value " + JSON.stringify(val) + " is not a valid document"
    );
  }
}

function concat(parts /*: Array<Doc> */) {
  if (process.env.NODE_ENV !== "production") {
    parts.forEach(assertDoc);
  }

  // We cannot do this until we change `printJSXElement` to not
  // access the internals of a document directly.
  // if(parts.length === 1) {
  //   // If it's a single document, no need to concat it.
  //   return parts[0];
  // }
  return { type: "concat", parts };
}

function indent(contents /*: Doc */) {
  if (process.env.NODE_ENV !== "production") {
    assertDoc(contents);
  }

  return { type: "indent", contents };
}

function group(contents /*: Doc */, opts /*: GroupDocOptions */) {
  opts = opts || {};

  if (process.env.NODE_ENV !== "production") {
    assertDoc(contents);
  }

  return {
    type: "group",
    id: opts.id,
    contents: contents,
    break: !!opts.shouldBreak,
    expandedStates: opts.expandedStates
  };
}

function makeAlign(n /*: DocAlignment */, contents /*: Doc */) {
  if (process.env.NODE_ENV !== "production") {
    assertDoc(contents);
  }

  return { type: "align", contents, n };
}

function align(n /*: number | string */, contents /*: Doc */) {
  return makeAlign(n, contents);
}

function dedentToRoot(contents /*: Doc */) {
  return makeAlign(-Infinity, contents);
}

function markAsRoot(contents /*: Doc */) {
  return makeAlign({ type: "root" }, contents);
}

function dedent(contents /*: Doc */) {
  return makeAlign(-1, contents);
}

function conditionalGroup(
  states /*: Array<Doc> */,
  opts /*: GroupDocOptions */
) {
  return group(
    states[0],
    Object.assign(opts || {}, { expandedStates: states })
  );
}

function fill(parts /*: Array<Doc> */) {
  if (process.env.NODE_ENV !== "production") {
    parts.forEach(assertDoc);
  }

  return { type: "fill", parts };
}

function ifBreak(
  breakContents /*: Doc */,
  flatContents /*: Doc */,
  opts /*: { groupId?: GroupDocId } */
) {
  opts = opts || {};

  if (process.env.NODE_ENV !== "production") {
    if (breakContents) {
      assertDoc(breakContents);
    }
    if (flatContents) {
      assertDoc(flatContents);
    }
  }

  return {
    type: "if-break",
    breakContents,
    flatContents,
    groupId: opts.groupId
  };
}

function lineSuffix(contents /*: Doc */) {
  if (process.env.NODE_ENV !== "production") {
    assertDoc(contents);
  }
  return { type: "line-suffix", contents };
}

const lineSuffixBoundary = { type: "line-suffix-boundary" };
const breakParent = { type: "break-parent" };
const line = { type: "line" };
const softline = { type: "line", soft: true };
const hardline = concat([{ type: "line", hard: true }, breakParent]);
const literalline = concat([
  { type: "line", hard: true, literal: true },
  breakParent
]);
const cursor = { type: "cursor", placeholder: Symbol("cursor") };

function join(sep /*: string */, arr /*: Array<Doc> */) {
  const res = [];

  for (let i = 0; i < arr.length; i++) {
    if (i !== 0) {
      res.push(sep);
    }

    res.push(arr[i]);
  }

  return concat(res);
}

function addAlignmentToDoc(
  doc /*: Doc */,
  size /*: number */,
  tabWidth /*: number */
) {
  let aligned = doc;
  if (size > 0) {
    // Use indent to add tabs for all the levels of tabs we need
    for (let i = 0; i < Math.floor(size / tabWidth); ++i) {
      aligned = indent(aligned);
    }
    // Use align for all the spaces that are needed
    aligned = align(size % tabWidth, aligned);
    // size is absolute from 0 and not relative to the current
    // indentation, so we use -Infinity to reset the indentation to 0
    aligned = align(-Infinity, aligned);
  }
  return aligned;
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
  fill,
  lineSuffix,
  lineSuffixBoundary,
  cursor,
  breakParent,
  ifBreak,
  indent,
  align,
  addAlignmentToDoc,
  markAsRoot,
  dedentToRoot,
  dedent
};
