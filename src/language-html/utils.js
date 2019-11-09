"use strict";

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

function shouldPreserveContent(node, options) {
  if (
    node.type === "element" &&
    node.fullName === "template" &&
    node.attrMap.lang &&
    node.attrMap.lang !== "html"
  ) {
    return true;
  }

  // unterminated node in ie conditional comment
  // e.g. <!--[if lt IE 9]><html><![endif]-->
  if (
    node.type === "ieConditionalComment" &&
    node.lastChild &&
    !node.lastChild.isSelfClosing &&
    !node.lastChild.endSourceSpan
  ) {
    return true;
  }

  // incomplete html in ie conditional comment
  // e.g. <!--[if lt IE 9]></div><![endif]-->
  if (node.type === "ieConditionalComment" && !node.complete) {
    return true;
  }

  // top-level elements (excluding <template>, <style> and <script>) in Vue SFC are considered custom block
  // custom blocks can be written in other languages so we should preserve them to not break the code
  if (
    options.parser === "vue" &&
    node.type === "element" &&
    node.parent.type === "root" &&
    [
      "template",
      "style",
      "script",
      // vue parser can be used for vue dom template as well, so we should still format top-level <html>
      "html"
    ].indexOf(node.fullName) === -1
  ) {
    return true;
  }

  // TODO: handle non-text children in <pre>
  if (
    isPreLikeNode(node) &&
    node.children.some(
      child => child.type !== "text" && child.type !== "interpolation"
    )
  ) {
    return true;
  }

  return false;
}

function hasPrettierIgnore(node) {
  if (node.type === "attribute" || isTextLikeNode(node)) {
    return false;
  }

  if (!node.parent) {
    return false;
  }

  if (typeof node.index !== "number" || node.index === 0) {
    return false;
  }

  const prevNode = node.parent.children[node.index - 1];
  return isPrettierIgnore(prevNode);
}

function isPrettierIgnore(node) {
  return node.type === "comment" && node.value.trim() === "prettier-ignore";
}

function getPrettierIgnoreAttributeCommentData(value) {
  const match = value.trim().match(/^prettier-ignore-attribute(?:\s+([^]+))?$/);

  if (!match) {
    return false;
  }

  if (!match[1]) {
    return true;
  }

  return match[1].split(/\s+/);
}

/** there's no opening/closing tag or it's considered not breakable */
function isTextLikeNode(node) {
  return node.type === "text" || node.type === "comment";
}

function isScriptLikeTag(node) {
  return (
    node.type === "element" &&
    (node.fullName === "script" ||
      node.fullName === "style" ||
      node.fullName === "svg:style")
  );
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

function isLeadingSpaceSensitiveNode(node) {
  const isLeadingSpaceSensitive = _isLeadingSpaceSensitiveNode();

  if (
    isLeadingSpaceSensitive &&
    !node.prev &&
    node.parent &&
    node.parent.tagDefinition &&
    node.parent.tagDefinition.ignoreFirstLf
  ) {
    return node.type === "interpolation";
  }

  return isLeadingSpaceSensitive;

  function _isLeadingSpaceSensitiveNode() {
    if (isFrontMatterNode(node)) {
      return false;
    }

    if (
      (node.type === "text" || node.type === "interpolation") &&
      node.prev &&
      (node.prev.type === "text" || node.prev.type === "interpolation")
    ) {
      return true;
    }

    if (!node.parent || node.parent.cssDisplay === "none") {
      return false;
    }

    if (isPreLikeNode(node.parent)) {
      return true;
    }

    if (
      !node.prev &&
      (node.parent.type === "root" ||
        isScriptLikeTag(node.parent) ||
        !isFirstChildLeadingSpaceSensitiveCssDisplay(node.parent.cssDisplay))
    ) {
      return false;
    }

    if (
      node.prev &&
      !isNextLeadingSpaceSensitiveCssDisplay(node.prev.cssDisplay)
    ) {
      return false;
    }

    return true;
  }
}

function isTrailingSpaceSensitiveNode(node) {
  if (isFrontMatterNode(node)) {
    return false;
  }

  if (
    (node.type === "text" || node.type === "interpolation") &&
    node.next &&
    (node.next.type === "text" || node.next.type === "interpolation")
  ) {
    return true;
  }

  if (!node.parent || node.parent.cssDisplay === "none") {
    return false;
  }

  if (isPreLikeNode(node.parent)) {
    return true;
  }

  if (
    !node.next &&
    (node.parent.type === "root" ||
      isScriptLikeTag(node.parent) ||
      !isLastChildTrailingSpaceSensitiveCssDisplay(node.parent.cssDisplay))
  ) {
    return false;
  }

  if (
    node.next &&
    !isPrevTrailingSpaceSensitiveCssDisplay(node.next.cssDisplay)
  ) {
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
    (node.type === "element" &&
      node.children.length !== 0 &&
      (["body", "script", "style"].indexOf(node.name) !== -1 ||
        node.children.some(child => hasNonTextChild(child)))) ||
    (node.firstChild &&
      node.firstChild === node.lastChild &&
      hasLeadingLineBreak(node.firstChild) &&
      (!node.lastChild.isTrailingSpaceSensitive ||
        hasTrailingLineBreak(node.lastChild)))
  );
}

/** spaces between children */
function forceBreakChildren(node) {
  return (
    node.type === "element" &&
    node.children.length !== 0 &&
    (["html", "head", "ul", "ol", "select"].indexOf(node.name) !== -1 ||
      (node.cssDisplay.startsWith("table") && node.cssDisplay !== "table-cell"))
  );
}

function preferHardlineAsLeadingSpaces(node) {
  return (
    preferHardlineAsSurroundingSpaces(node) ||
    (node.prev && preferHardlineAsTrailingSpaces(node.prev)) ||
    hasSurroundingLineBreak(node)
  );
}

function preferHardlineAsTrailingSpaces(node) {
  return (
    preferHardlineAsSurroundingSpaces(node) ||
    (node.type === "element" && node.fullName === "br") ||
    hasSurroundingLineBreak(node)
  );
}

function hasSurroundingLineBreak(node) {
  return hasLeadingLineBreak(node) && hasTrailingLineBreak(node);
}

function hasLeadingLineBreak(node) {
  return (
    node.hasLeadingSpaces &&
    (node.prev
      ? node.prev.sourceSpan.end.line < node.sourceSpan.start.line
      : node.parent.type === "root" ||
        node.parent.startSourceSpan.end.line < node.sourceSpan.start.line)
  );
}

function hasTrailingLineBreak(node) {
  return (
    node.hasTrailingSpaces &&
    (node.next
      ? node.next.sourceSpan.start.line > node.sourceSpan.end.line
      : node.parent.type === "root" ||
        node.parent.endSourceSpan.start.line > node.sourceSpan.end.line)
  );
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
  if (node.name === "script" && !node.attrMap.src) {
    if (
      (!node.attrMap.lang && !node.attrMap.type) ||
      node.attrMap.type === "module" ||
      node.attrMap.type === "text/javascript" ||
      node.attrMap.type === "text/babel" ||
      node.attrMap.type === "application/javascript"
    ) {
      return "babel";
    }

    if (
      node.attrMap.type === "application/x-typescript" ||
      node.attrMap.lang === "ts" ||
      node.attrMap.lang === "tsx"
    ) {
      return "typescript";
    }

    if (node.attrMap.type === "text/markdown") {
      return "markdown";
    }

    if (
      node.attrMap.type.endsWith("json") ||
      node.attrMap.type.endsWith("importmap")
    ) {
      return "json";
    }
  }

  if (node.name === "style") {
    if (
      !node.attrMap.lang ||
      node.attrMap.lang === "postcss" ||
      node.attrMap.lang === "css"
    ) {
      return "css";
    }

    if (node.attrMap.lang === "scss") {
      return "scss";
    }

    if (node.attrMap.lang === "less") {
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
  return !isBlockLikeCssDisplay(cssDisplay) && cssDisplay !== "inline-block";
}

function isLastChildTrailingSpaceSensitiveCssDisplay(cssDisplay) {
  return !isBlockLikeCssDisplay(cssDisplay) && cssDisplay !== "inline-block";
}

function isPrevTrailingSpaceSensitiveCssDisplay(cssDisplay) {
  return !isBlockLikeCssDisplay(cssDisplay);
}

function isNextLeadingSpaceSensitiveCssDisplay(cssDisplay) {
  return !isBlockLikeCssDisplay(cssDisplay);
}

function isDanglingSpaceSensitiveCssDisplay(cssDisplay) {
  return !isBlockLikeCssDisplay(cssDisplay) && cssDisplay !== "inline-block";
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

function hasParent(node, fn) {
  let current = node;

  while (current) {
    if (fn(current)) {
      return true;
    }

    current = current.parent;
  }

  return false;
}

function getNodeCssStyleDisplay(node, options) {
  if (node.prev && node.prev.type === "comment") {
    // <!-- display: block -->
    const match = node.prev.value.match(/^\s*display:\s*([a-z]+)\s*$/);
    if (match) {
      return match[1];
    }
  }

  let isInSvgForeignObject = false;
  if (node.type === "element" && node.namespace === "svg") {
    if (hasParent(node, parent => parent.fullName === "svg:foreignObject")) {
      isInSvgForeignObject = true;
    } else {
      return node.name === "svg" ? "inline-block" : "block";
    }
  }

  switch (options.htmlWhitespaceSensitivity) {
    case "strict":
      return "inline";
    case "ignore":
      return "block";
    default:
      return (
        (node.type === "element" &&
          (!node.namespace || isInSvgForeignObject) &&
          CSS_DISPLAY_TAGS[node.name]) ||
        CSS_DISPLAY_DEFAULT
      );
  }
}

function getNodeCssStyleWhiteSpace(node) {
  return (
    (node.type === "element" &&
      !node.namespace &&
      CSS_WHITE_SPACE_TAGS[node.name]) ||
    CSS_WHITE_SPACE_DEFAULT
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

function shouldNotPrintClosingTag(node, options) {
  return (
    !node.isSelfClosing &&
    !node.endSourceSpan &&
    (hasPrettierIgnore(node) || shouldPreserveContent(node.parent, options))
  );
}

function countChars(text, char) {
  let counter = 0;
  for (let i = 0; i < text.length; i++) {
    if (text[i] === char) {
      counter++;
    }
  }
  return counter;
}

function unescapeQuoteEntities(text) {
  return text.replace(/&apos;/g, "'").replace(/&quot;/g, '"');
}

module.exports = {
  HTML_ELEMENT_ATTRIBUTES,
  HTML_TAGS,
  canHaveInterpolation,
  countChars,
  countParents,
  dedentString,
  forceBreakChildren,
  forceBreakContent,
  forceNextEmptyLine,
  getLastDescendant,
  getNodeCssStyleDisplay,
  getNodeCssStyleWhiteSpace,
  getPrettierIgnoreAttributeCommentData,
  hasPrettierIgnore,
  identity,
  inferScriptParser,
  isDanglingSpaceSensitiveNode,
  isFrontMatterNode,
  isIndentationSensitiveNode,
  isLeadingSpaceSensitiveNode,
  isPreLikeNode,
  isScriptLikeTag,
  isTextLikeNode,
  isTrailingSpaceSensitiveNode,
  isWhitespaceSensitiveNode,
  normalizeParts,
  preferHardlineAsLeadingSpaces,
  preferHardlineAsTrailingSpaces,
  shouldNotPrintClosingTag,
  shouldPreserveContent,
  unescapeQuoteEntities
};
