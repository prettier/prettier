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
  if (node.type === "attribute" || node.type === "text") {
    return false;
  }

  // TODO: handle non-text children in <pre>
  if (
    isPreLikeNode(node) &&
    node.children.some(child => child.type !== "text")
  ) {
    return true;
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
  return node.type === "comment" && node.value.trim() === "prettier-ignore";
}

function isElement(node, nameOrNames) {
  if (node.type !== "element") {
    return false;
  }

  if (!nameOrNames) {
    return true;
  }

  if (typeof nameOrNames === "string") {
    return node.name === nameOrNames;
  }

  return nameOrNames.indexOf(node.name) !== -1;
}

function isScriptLikeTag(node) {
  return isElement(node, ["script", "style"]);
}

function isFrontMatterNode(node) {
  return node.type === "yaml" || node.type === "toml";
}

function canHaveInterpolation(node) {
  return node.children && !isScriptLikeTag(node);
}

function isWhitespaceSensitiveNode(node) {
  return (
    isScriptLikeTag(node) ||
    node.type === "interpolation" ||
    isIndentationSensitiveNode(node)
  );
}

function isIndentationSensitiveNode(node) {
  return getNodeCssStyleWhiteSpace(node).startsWith("pre");
}

function isLeadingSpaceSensitiveNode(node, { prev, parent }) {
  if (isFrontMatterNode(node)) {
    return false;
  }

  if (!parent || parent.cssDisplay === "none") {
    return false;
  }

  if (!node.prev && isElement(parent) && parent.tagDefinition.ignoreFirstLf) {
    return false;
  }

  if (isPreLikeNode(parent)) {
    return true;
  }

  if (
    !prev &&
    (parent.type === "root" ||
      isScriptLikeTag(parent) ||
      !isFirstChildLeadingSpaceSensitiveCssDisplay(parent.cssDisplay))
  ) {
    return false;
  }

  if (prev && !isNextLeadingSpaceSensitiveCssDisplay(prev.cssDisplay)) {
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

  if (isPreLikeNode(parent)) {
    return true;
  }

  if (
    !next &&
    (parent.type === "root" ||
      isScriptLikeTag(parent) ||
      !isLastChildTrailingSpaceSensitiveCssDisplay(parent.cssDisplay))
  ) {
    return false;
  }

  if (next && !isPrevTrailingSpaceSensitiveCssDisplay(next.cssDisplay)) {
    return false;
  }

  return true;
}

function isDanglingSpaceSensitiveNode(node) {
  return (
    isDanglingSpaceSensitiveCssDisplay(node.cssDisplay) &&
    !isScriptLikeTag(node)
  );
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
  return (
    isFrontMatterNode(node) ||
    (node.next &&
      node.sourceSpan.end.line + 1 < node.next.sourceSpan.start.line)
  );
}

/** firstChild leadingSpaces and lastChild trailingSpaces */
function forceBreakContent(node) {
  return (
    forceBreakChildren(node) ||
    (isElement(node) &&
      node.children.length !== 0 &&
      (["body", "template", "script", "style"].indexOf(node.name) !== -1 ||
        node.children.some(child => hasNonTextChild(child))))
  );
}

/** spaces between children */
function forceBreakChildren(node) {
  return (
    isElement(node) &&
    node.children.length !== 0 &&
    (["html", "head", "ul", "ol", "select"].indexOf(node.name) !== -1 ||
      (node.cssDisplay.startsWith("table") && node.cssDisplay !== "table-cell"))
  );
}

function preferHardlineAsLeadingSpaces(node) {
  return (
    preferHardlineAsSurroundingSpaces(node) ||
    (node.prev && preferHardlineAsTrailingSpaces(node.prev))
  );
}

function preferHardlineAsTrailingSpaces(node) {
  return preferHardlineAsSurroundingSpaces(node) || isElement(node, "br");
}

function preferHardlineAsSurroundingSpaces(node) {
  switch (node.type) {
    case "ieConditionalComment":
    case "comment":
    case "directive":
      return true;
    case "element":
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
  const attrMap = node.attrs.reduce((reduced, attr) => {
    reduced[attr.name] = attr.value;
    return reduced;
  }, {});

  if (node.name === "script" && !attrMap.src) {
    if (
      (!attrMap.lang && !attrMap.type) ||
      attrMap.type === "module" ||
      attrMap.type === "text/javascript" ||
      attrMap.type === "text/babel" ||
      attrMap.type === "application/javascript"
    ) {
      return "babylon";
    }

    if (
      attrMap.type === "application/x-typescript" ||
      attrMap.lang === "ts" ||
      attrMap.lang === "tsx"
    ) {
      return "typescript";
    }

    if (attrMap.type === "text/markdown") {
      return "markdown";
    }
  }

  if (node.name === "style") {
    if (!attrMap.lang || attrMap.lang === "postcss") {
      return "css";
    }

    if (attrMap.lang === "scss") {
      return "scss";
    }

    if (attrMap.lang === "less") {
      return "less";
    }
  }

  return null;
}

function isBlockLikeCssDisplay(cssDisplay) {
  return (
    cssDisplay === "block" ||
    cssDisplay === "list-item" ||
    cssDisplay.startsWith("table")
  );
}

function isFirstChildLeadingSpaceSensitiveCssDisplay(cssDisplay) {
  return !isBlockLikeCssDisplay(cssDisplay);
}

function isLastChildTrailingSpaceSensitiveCssDisplay(cssDisplay) {
  return !isBlockLikeCssDisplay(cssDisplay);
}

function isPrevTrailingSpaceSensitiveCssDisplay(cssDisplay) {
  return !isBlockLikeCssDisplay(cssDisplay);
}

function isNextLeadingSpaceSensitiveCssDisplay(cssDisplay) {
  return !isBlockLikeCssDisplay(cssDisplay);
}

function isDanglingSpaceSensitiveCssDisplay(cssDisplay) {
  return !isBlockLikeCssDisplay(cssDisplay);
}

function isPreLikeNode(node) {
  return getNodeCssStyleWhiteSpace(node).startsWith("pre");
}

function countParents(path, predicate = () => true) {
  let counter = 0;
  for (let i = path.stack.length - 1; i >= 0; i--) {
    const value = path.stack[i];
    if (
      value &&
      typeof value === "object" &&
      !Array.isArray(value) &&
      predicate(value)
    ) {
      counter++;
    }
  }
  return counter;
}

function getNodeCssStyleDisplay(node, prevNode, options) {
  if (prevNode && prevNode.type === "comment") {
    // <!-- display: block -->
    const match = prevNode.value.match(/^\s*display:\s*([a-z]+)\s*$/);
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
      if (isElement(node, "template")) {
        return "inline";
      }
      return (
        (isElement(node) && CSS_DISPLAY_TAGS[node.name]) || CSS_DISPLAY_DEFAULT
      );
  }
}

function getNodeCssStyleWhiteSpace(node) {
  return (
    (isElement(node) && CSS_WHITE_SPACE_TAGS[node.name]) ||
    CSS_WHITE_SPACE_DEFAULT
  );
}

function getCommentData(node) {
  const rightTrimmedValue = node.value.trimRight();

  const hasLeadingEmptyLine = /^[^\S\n]*?\n/.test(node.value);
  if (hasLeadingEmptyLine) {
    /**
     *     <!--
     *     123
     *        456
     *     -->
     */
    return dedentString(rightTrimmedValue.replace(/^\s*\n/, ""));
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
  if (!rightTrimmedValue.includes("\n")) {
    return rightTrimmedValue.trimLeft();
  }

  const firstNewlineIndex = rightTrimmedValue.indexOf("\n");
  const dataWithoutLeadingLine = rightTrimmedValue.slice(firstNewlineIndex + 1);
  const minIndentationForDataWithoutLeadingLine = getMinIndentation(
    dataWithoutLeadingLine
  );

  const leadingSpaces = rightTrimmedValue.match(/^[^\n\S]*/)[0].length;
  const commentDataStartColumn =
    node.sourceSpan.start.col + "<!--".length + leadingSpaces;

  /**
   *     <!-- 123
   *          456 -->
   */
  if (minIndentationForDataWithoutLeadingLine >= commentDataStartColumn) {
    return dedentString(
      " ".repeat(commentDataStartColumn) +
        rightTrimmedValue.slice(leadingSpaces)
    );
  }

  const leadingLineValue = rightTrimmedValue.slice(0, firstNewlineIndex);
  /**
   *     <!-- 123
   *     456 -->
   */
  return (
    leadingLineValue.trim() +
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
    if (lineText.length === 0) {
      continue;
    }

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

  const restParts = parts.slice();
  while (restParts.length !== 0) {
    const part = restParts.shift();

    if (!part) {
      continue;
    }

    if (part.type === "concat") {
      Array.prototype.unshift.apply(restParts, part.parts);
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

function identity(x) {
  return x;
}

module.exports = {
  HTML_ELEMENT_ATTRIBUTES,
  HTML_TAGS,
  canHaveInterpolation,
  countParents,
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
  identity,
  inferScriptParser,
  isDanglingSpaceSensitiveNode,
  isElement,
  isFrontMatterNode,
  isIndentationSensitiveNode,
  isLeadingSpaceSensitiveNode,
  isPreLikeNode,
  isScriptLikeTag,
  isTrailingSpaceSensitiveNode,
  isWhitespaceSensitiveNode,
  mapNode,
  normalizeParts,
  preferHardlineAsLeadingSpaces,
  preferHardlineAsTrailingSpaces,
  replaceDocNewlines,
  replaceNewlines
};
