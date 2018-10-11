"use strict";

const {
  builders: { concat },
  utils: { mapDoc }
} = require("../doc");

const {
  CSS_DISPLAY_TAGS,
  CSS_DISPLAY_DEFAULT,
  CSS_WHITE_SPACE_TAGS,
  CSS_WHITE_SPACE_DEFAULT
} = require("./constants.evaluate");

const htmlTagNames = require("html-tag-names");
const htmlElementAttributes = require("html-element-attributes");

const HTML_TAGS = arrayToMap(htmlTagNames);
const HTML_ELEMENT_ATTRIBUTES = mapObject(htmlElementAttributes, arrayToMap);

// NOTE: must be same as the one in htmlparser2 so that the parsing won't be inconsistent
//       https://github.com/fb55/htmlparser2/blob/v3.9.2/lib/Parser.js#L59-L91
const VOID_TAGS = arrayToMap([
  "area",
  "base",
  "basefont",
  "br",
  "col",
  "command",
  "embed",
  "frame",
  "hr",
  "img",
  "input",
  "isindex",
  "keygen",
  "link",
  "meta",
  "param",
  "source",
  "track",
  "wbr",

  "path",
  "circle",
  "ellipse",
  "line",
  "rect",
  "use",
  "stop",
  "polyline",
  "polygon"
]);

function arrayToMap(array) {
  const map = Object.create(null);
  for (const value of array) {
    map[value] = true;
  }
  return map;
}

function mapObject(object, fn) {
  const newObject = Object.create(null);
  for (const key of Object.keys(object)) {
    newObject[key] = fn(object[key], key);
  }
  return newObject;
}

function hasPrettierIgnore(path) {
  const node = path.getValue();
  if (node.type === "attribute") {
    return false;
  }

  const parentNode = path.getParentNode();
  if (!parentNode) {
    return false;
  }

  const index = path.getName();
  if (typeof index !== "number" || index === 0) {
    return false;
  }

  const prevNode = parentNode.children[index - 1];
  return isPrettierIgnore(prevNode);
}

function isPrettierIgnore(node) {
  return node.type === "comment" && node.data.trim() === "prettier-ignore";
}

function isTag(node) {
  return node.type === "tag";
}

function isScriptLikeTag(node) {
  return isTag(node) && (node.name === "script" || node.name === "style");
}

function isFrontMatterNode(node) {
  return node.type === "yaml" || node.type === "toml";
}

function isLeadingSpaceSensitiveNode(node, { prev, parent }) {
  if (isFrontMatterNode(node)) {
    return false;
  }

  if (!parent || parent.cssDisplay === "none") {
    return false;
  }

  if (
    !prev &&
    (parent.type === "root" ||
      isScriptLikeTag(parent) ||
      parent.cssDisplay === "block")
  ) {
    return false;
  }

  if (prev && prev.cssDisplay === "block") {
    return false;
  }

  return true;
}

function isTrailingSpaceSensitiveNode(node, { next, parent }) {
  if (isFrontMatterNode(node)) {
    return false;
  }

  if (!parent || parent.cssDisplay === "none") {
    return false;
  }

  if (
    !next &&
    (parent.type === "root" ||
      isScriptLikeTag(parent) ||
      parent.cssDisplay === "block")
  ) {
    return false;
  }

  if (next && next.cssDisplay === "block") {
    return false;
  }

  return true;
}

function isDanglingSpaceSensitiveNode(/* node */) {
  return true;
}

/**
 * @param {unknown} node
 * @param {(node: unknown, stack: Array<string | object>)} fn
 * @param {unknown=} parent
 */
function mapNode(node, fn, stack = []) {
  const newNode = Object.assign({}, node);

  if (newNode.children) {
    newNode.children = newNode.children.map((child, childIndex) =>
      mapNode(child, fn, [childIndex, node].concat(stack))
    );
  }

  return fn(newNode, stack);
}

function getPrevNode(stack) {
  const [index, parent] = stack;

  if (typeof index !== "number" || index === 0) {
    return null;
  }

  return parent.children[index - 1];
}

function replaceNewlines(text, replacement) {
  return text
    .split(/(\n)/g)
    .map((data, index) => (index % 2 === 1 ? replacement : data));
}

function replaceDocNewlines(doc, replacement) {
  return mapDoc(
    doc,
    currentDoc =>
      typeof currentDoc === "string" && currentDoc.includes("\n")
        ? concat(replaceNewlines(currentDoc, replacement))
        : currentDoc
  );
}

function forceNextEmptyLine(node) {
  return isFrontMatterNode(node);
}

/** firstChild leadingSpaces and lastChild trailingSpaces */
function forceBreakContent(node) {
  return (
    forceBreakChildren(node) ||
    (isTag(node) &&
      node.children.length !== 0 &&
      (["body", "template"].indexOf(node.name) !== -1 ||
        node.children.some(child => hasNonTextChild(child))))
  );
}

/** spaces between children */
function forceBreakChildren(node) {
  return (
    isTag(node) &&
    node.children.length !== 0 &&
    ["html", "head", "ul", "ol", "select"].indexOf(node.name) !== -1
  );
}

function preferHardlineAsLeadingSpaces(node) {
  return (
    preferHardlineAsSurroundingSpaces(node) ||
    (node.prev && preferHardlineAsTrailingSpaces(node.prev))
  );
}

function preferHardlineAsTrailingSpaces(node) {
  return (
    preferHardlineAsSurroundingSpaces(node) ||
    (isTag(node) && node.name === "br")
  );
}

function preferHardlineAsSurroundingSpaces(node) {
  switch (node.type) {
    case "ieConditionalComment":
    case "comment":
    case "directive":
      return true;
    case "tag":
      return ["script", "select"].indexOf(node.name) !== -1;
  }
  return false;
}

function getLastDescendant(node) {
  return node.lastChild ? getLastDescendant(node.lastChild) : node;
}

function hasNonTextChild(node) {
  return node.children && node.children.some(child => child.type !== "text");
}

function inferScriptParser(node) {
  if (
    node.name === "script" &&
    ((!node.attribs.lang && !node.attribs.type) ||
      node.attribs.type === "text/javascript" ||
      node.attribs.type === "text/babel" ||
      node.attribs.type === "application/javascript")
  ) {
    return "babylon";
  }

  if (
    node.name === "script" &&
    (node.attribs.type === "application/x-typescript" ||
      node.attribs.lang === "ts")
  ) {
    return "typescript";
  }

  if (node.name === "style") {
    return "css";
  }

  return null;
}

function getNodeCssStyleDisplay(node, prevNode, options) {
  switch (getNodeCssStyleWhiteSpace(node)) {
    case "pre":
    case "pre-wrap":
      // textarea-like
      return "block";
  }

  if (prevNode && prevNode.type === "comment") {
    // <!-- display: block -->
    const match = prevNode.data.match(/^\s*display:\s*([a-z]+)\s*$/);
    if (match) {
      return match[1];
    }
  }

  switch (options.htmlWhitespaceSensitivity) {
    case "strict":
      return "inline";
    case "ignore":
      return "block";
    default:
      return (
        (isTag(node) && CSS_DISPLAY_TAGS[node.name]) || CSS_DISPLAY_DEFAULT
      );
  }
}

function getNodeCssStyleWhiteSpace(node) {
  return (
    (isTag(node) && CSS_WHITE_SPACE_TAGS[node.name]) || CSS_WHITE_SPACE_DEFAULT
  );
}

function getCommentData(node) {
  const rightTrimmedData = node.data.trimRight();

  const hasLeadingEmptyLine = /^[^\S\n]*?\n/.test(node.data);
  if (hasLeadingEmptyLine) {
    /**
     *     <!--
     *     123
     *        456
     *     -->
     */
    return dedentString(rightTrimmedData.replace(/^\s*\n/, ""));
  }

  /**
   *     <!-- 123 -->
   *
   *     <!-- 123
   *     -->
   *
   *     <!-- 123
   *
   *     -->
   */
  if (!rightTrimmedData.includes("\n")) {
    return rightTrimmedData.trimLeft();
  }

  const firstNewlineIndex = rightTrimmedData.indexOf("\n");
  const dataWithoutLeadingLine = rightTrimmedData.slice(firstNewlineIndex + 1);
  const minIndentationForDataWithoutLeadingLine = getMinIndentation(
    dataWithoutLeadingLine
  );

  const commentDataStartColumn = node.startLocation.column + "<!--".length;

  /**
   *     <!-- 123
   *          456 -->
   */
  if (minIndentationForDataWithoutLeadingLine >= commentDataStartColumn) {
    return dedentString(
      " ".repeat(commentDataStartColumn) + "\n" + rightTrimmedData
    );
  }

  const leadingLineData = rightTrimmedData.slice(0, firstNewlineIndex);
  /**
   *     <!-- 123
   *     456 -->
   */
  return (
    leadingLineData.trim() +
    "\n" +
    dedentString(
      dataWithoutLeadingLine,
      minIndentationForDataWithoutLeadingLine
    )
  );
}

function getMinIndentation(text) {
  let minIndentation = Infinity;

  for (const lineText of text.split("\n")) {
    if (/\S/.test(lineText[0])) {
      return 0;
    }

    const indentation = lineText.match(/^\s*/)[0].length;

    if (lineText.length === indentation) {
      continue;
    }

    if (indentation < minIndentation) {
      minIndentation = indentation;
    }
  }

  return minIndentation === Infinity ? 0 : minIndentation;
}

function dedentString(text, minIndent = getMinIndentation(text)) {
  return minIndent === 0
    ? text
    : text
        .split("\n")
        .map(lineText => lineText.slice(minIndent))
        .join("\n");
}

function normalizeParts(parts) {
  const newParts = [];

  for (const part of parts) {
    if (!part) {
      continue;
    }

    if (
      newParts.length !== 0 &&
      typeof newParts[newParts.length - 1] === "string" &&
      typeof part === "string"
    ) {
      newParts.push(newParts.pop() + part);
      continue;
    }

    newParts.push(part);
  }

  return newParts;
}

module.exports = {
  HTML_ELEMENT_ATTRIBUTES,
  HTML_TAGS,
  VOID_TAGS,
  dedentString,
  forceBreakChildren,
  forceBreakContent,
  forceNextEmptyLine,
  getCommentData,
  getLastDescendant,
  getNodeCssStyleDisplay,
  getNodeCssStyleWhiteSpace,
  getPrevNode,
  hasPrettierIgnore,
  inferScriptParser,
  isDanglingSpaceSensitiveNode,
  isFrontMatterNode,
  isLeadingSpaceSensitiveNode,
  isScriptLikeTag,
  isTrailingSpaceSensitiveNode,
  mapNode,
  normalizeParts,
  preferHardlineAsLeadingSpaces,
  preferHardlineAsTrailingSpaces,
  replaceDocNewlines,
  replaceNewlines
};
