/**
 * @import AstPath from "../../common/ast-path.js"
 */

import {
  hardline,
  join,
  line,
  replaceEndOfLine,
} from "../../document/index.js";
import { isFrontMatter } from "../../main/front-matter/index.js";
import htmlWhitespace from "../../utilities/html-whitespace.js";
import inferParser from "../../utilities/infer-parser.js";
import {
  CSS_DISPLAY_DEFAULT,
  CSS_DISPLAY_TAGS,
  CSS_WHITE_SPACE_DEFAULT,
  CSS_WHITE_SPACE_TAGS,
} from "../constants.evaluate.js";
import isUnknownNamespace from "./is-unknown-namespace.js";

const htmlTrimLeadingBlankLines = (string) =>
  string.replaceAll(/^[\t\f\r ]*\n/gu, "");
const htmlTrimPreserveIndentation = (string) =>
  htmlTrimLeadingBlankLines(htmlWhitespace.trimEnd(string));
const getLeadingAndTrailingHtmlWhitespace = (string) => {
  let text = string;
  const leadingWhitespace = htmlWhitespace.getLeadingWhitespace(text);
  if (leadingWhitespace) {
    text = text.slice(leadingWhitespace.length);
  }
  const trailingWhitespace = htmlWhitespace.getTrailingWhitespace(text);
  if (trailingWhitespace) {
    text = text.slice(0, -trailingWhitespace.length);
  }

  return {
    leadingWhitespace,
    trailingWhitespace,
    text,
  };
};

function shouldPreserveContent(node, options) {
  // unterminated node in ie conditional comment
  // e.g. <!--[if lt IE 9]><html><![endif]-->
  if (
    node.kind === "ieConditionalComment" &&
    node.lastChild &&
    !node.lastChild.isSelfClosing &&
    !node.lastChild.endSourceSpan
  ) {
    return true;
  }

  // incomplete html in ie conditional comment
  // e.g. <!--[if lt IE 9]></div><![endif]-->
  if (node.kind === "ieConditionalComment" && !node.complete) {
    return true;
  }

  // TODO: handle non-text children in <pre>
  if (
    isPreLikeNode(node) &&
    node.children.some(
      (child) => child.kind !== "text" && child.kind !== "interpolation",
    )
  ) {
    return true;
  }

  if (
    isVueNonHtmlBlock(node, options) &&
    !isScriptLikeTag(node, options) &&
    node.kind !== "interpolation"
  ) {
    return true;
  }

  return false;
}

function hasPrettierIgnore(node) {
  /* c8 ignore next 3 */
  if (node.kind === "attribute") {
    return false;
  }

  /* c8 ignore next 3 */
  if (!node.parent) {
    return false;
  }

  if (!node.prev) {
    return false;
  }

  return isPrettierIgnore(node.prev);
}

function isPrettierIgnore(node) {
  return node.kind === "comment" && node.value.trim() === "prettier-ignore";
}

/** there's no opening/closing tag or it's considered not breakable */
function isTextLikeNode(node) {
  return node.kind === "text" || node.kind === "comment";
}

function isScriptLikeTag(node, options) {
  return (
    node.kind === "element" &&
    (node.fullName === "script" ||
      node.fullName === "style" ||
      node.fullName === "svg:style" ||
      node.fullName === "svg:script" ||
      (node.fullName === "mj-style" && options.parser === "mjml") ||
      (isUnknownNamespace(node) &&
        (node.name === "script" || node.name === "style")))
  );
}

function canHaveInterpolation(node, options) {
  return node.children && !isScriptLikeTag(node, options);
}

function isWhitespaceSensitiveNode(node, options) {
  return (
    isScriptLikeTag(node, options) ||
    node.kind === "interpolation" ||
    isIndentationSensitiveNode(node)
  );
}

function isIndentationSensitiveNode(node) {
  return getNodeCssStyleWhiteSpace(node).startsWith("pre");
}

function isLeadingSpaceSensitiveNode(node, options) {
  const isLeadingSpaceSensitive = _isLeadingSpaceSensitiveNode();

  if (
    isLeadingSpaceSensitive &&
    !node.prev &&
    node.parent?.tagDefinition?.ignoreFirstLf
  ) {
    return node.kind === "interpolation";
  }

  return isLeadingSpaceSensitive;

  function _isLeadingSpaceSensitiveNode() {
    if (isFrontMatter(node) || node.kind === "angularControlFlowBlock") {
      return false;
    }

    if (
      (node.kind === "text" || node.kind === "interpolation") &&
      node.prev &&
      (node.prev.kind === "text" || node.prev.kind === "interpolation")
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
      (node.parent.kind === "root" ||
        (isPreLikeNode(node) && node.parent) ||
        isScriptLikeTag(node.parent, options) ||
        isVueCustomBlock(node.parent, options) ||
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

function isTrailingSpaceSensitiveNode(node, options) {
  if (isFrontMatter(node) || node.kind === "angularControlFlowBlock") {
    return false;
  }

  if (
    (node.kind === "text" || node.kind === "interpolation") &&
    node.next &&
    (node.next.kind === "text" || node.next.kind === "interpolation")
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
    (node.parent.kind === "root" ||
      (isPreLikeNode(node) && node.parent) ||
      isScriptLikeTag(node.parent, options) ||
      isVueCustomBlock(node.parent, options) ||
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

function isDanglingSpaceSensitiveNode(node, options) {
  return (
    isDanglingSpaceSensitiveCssDisplay(node.cssDisplay) &&
    !isScriptLikeTag(node, options)
  );
}

function forceNextEmptyLine(node) {
  return (
    isFrontMatter(node) ||
    (node.next &&
      node.sourceSpan.end &&
      node.sourceSpan.end.line + 1 < node.next.sourceSpan.start.line)
  );
}

/** firstChild leadingSpaces and lastChild trailingSpaces */
function forceBreakContent(node) {
  return (
    forceBreakChildren(node) ||
    (node.kind === "element" &&
      node.children.length > 0 &&
      (["body", "script", "style"].includes(node.name) ||
        node.children.some((child) => hasNonTextChild(child)))) ||
    (node.firstChild &&
      node.firstChild === node.lastChild &&
      node.firstChild.kind !== "text" &&
      hasLeadingLineBreak(node.firstChild) &&
      (!node.lastChild.isTrailingSpaceSensitive ||
        hasTrailingLineBreak(node.lastChild)))
  );
}

/** spaces between children */
function forceBreakChildren(node) {
  return (
    node.kind === "element" &&
    node.children.length > 0 &&
    (["html", "head", "ul", "ol", "select"].includes(node.name) ||
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
    (node.kind === "element" && node.fullName === "br") ||
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
      : node.parent.kind === "root" ||
        node.parent.startSourceSpan.end.line < node.sourceSpan.start.line)
  );
}

function hasTrailingLineBreak(node) {
  return (
    node.hasTrailingSpaces &&
    (node.next
      ? node.next.sourceSpan.start.line > node.sourceSpan.end.line
      : node.parent.kind === "root" ||
        (node.parent.endSourceSpan &&
          node.parent.endSourceSpan.start.line > node.sourceSpan.end.line))
  );
}

function preferHardlineAsSurroundingSpaces(node) {
  switch (node.kind) {
    case "ieConditionalComment":
    case "comment":
    case "directive":
      return true;
    case "element":
      return ["script", "select"].includes(node.name);
  }
  return false;
}

function getLastDescendant(node) {
  return node.lastChild ? getLastDescendant(node.lastChild) : node;
}

function hasNonTextChild(node) {
  return node.children?.some((child) => child.kind !== "text");
}

function inferParserByTypeAttribute(type) {
  if (!type) {
    return;
  }

  switch (type) {
    case "module":
    case "text/javascript":
    case "text/babel":
    case "text/jsx":
    case "application/javascript":
      return "babel";

    case "application/x-typescript":
      return "typescript";

    case "text/markdown":
      return "markdown";

    case "text/html":
      return "html";

    case "text/x-handlebars-template":
      return "glimmer";

    default:
      if (
        type.endsWith("json") ||
        type.endsWith("importmap") ||
        type === "speculationrules"
      ) {
        return "json";
      }
  }
}

function inferScriptParser(node, options) {
  const { name, attrMap } = node;

  if (name !== "script" || Object.hasOwn(attrMap, "src")) {
    return;
  }

  const { type, lang } = node.attrMap;

  if (!lang && !type) {
    return "babel";
  }

  return (
    inferParser(options, { language: lang }) ?? inferParserByTypeAttribute(type)
  );
}

function inferVueSfcBlockParser(node, options) {
  if (!isVueNonHtmlBlock(node, options)) {
    return;
  }
  const { attrMap } = node;

  if (Object.hasOwn(attrMap, "src")) {
    return;
  }

  const { type, lang } = attrMap;

  return (
    inferParser(options, { language: lang }) ?? inferParserByTypeAttribute(type)
  );
}

function inferStyleParser(node, options) {
  if (node.name === "style") {
    const { lang } = node.attrMap;
    return lang ? inferParser(options, { language: lang }) : "css";
  }

  if (node.name === "mj-style" && options.parser === "mjml") {
    return "css";
  }
}

function inferElementParser(node, options) {
  return (
    inferScriptParser(node, options) ??
    inferStyleParser(node, options) ??
    inferVueSfcBlockParser(node, options)
  );
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
  // Every root block in Vue SFC is a block
  if (isVueSfcBlock(node, options)) {
    return "block";
  }

  if (node.prev?.kind === "comment") {
    // <!-- display: block -->
    const match = node.prev.value.match(/^\s*display:\s*([a-z]+)\s*$/u);
    if (match) {
      return match[1];
    }
  }

  let isInSvgForeignObject = false;
  if (node.kind === "element" && node.namespace === "svg") {
    if (hasParent(node, (parent) => parent.fullName === "svg:foreignObject")) {
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
      if (
        node.kind === "element" &&
        (!node.namespace || isInSvgForeignObject || isUnknownNamespace(node)) &&
        Object.hasOwn(CSS_DISPLAY_TAGS, node.name)
      ) {
        return CSS_DISPLAY_TAGS[node.name];
      }
  }

  return CSS_DISPLAY_DEFAULT;
}

function getNodeCssStyleWhiteSpace(node) {
  if (
    node.kind === "element" &&
    (!node.namespace || isUnknownNamespace(node)) &&
    Object.hasOwn(CSS_WHITE_SPACE_TAGS, node.name)
  ) {
    return CSS_WHITE_SPACE_TAGS[node.name];
  }

  return CSS_WHITE_SPACE_DEFAULT;
}

function unescapeQuoteEntities(text) {
  return text.replaceAll("&apos;", "'").replaceAll("&quot;", '"');
}

function getUnescapedAttributeValue(node) {
  return unescapeQuoteEntities(node.value);
}

// top-level elements (excluding <template>, <style> and <script>) in Vue SFC are considered custom block
// See https://vue-loader.vuejs.org/spec.html for detail
const vueRootElementsSet = new Set(["template", "style", "script"]);
function isVueCustomBlock(node, options) {
  return isVueSfcBlock(node, options) && !vueRootElementsSet.has(node.fullName);
}

function isVueSfcBlock(node, options) {
  return (
    options.parser === "vue" &&
    node.kind === "element" &&
    node.parent.kind === "root" &&
    node.fullName.toLowerCase() !== "html"
  );
}

function isVueNonHtmlBlock(node, options) {
  return (
    isVueSfcBlock(node, options) &&
    (isVueCustomBlock(node, options) ||
      (node.attrMap.lang && node.attrMap.lang !== "html"))
  );
}

function isVueSlotAttribute(attribute) {
  const attributeName = attribute.fullName;
  return (
    attributeName.charAt(0) === "#" ||
    attributeName === "slot-scope" ||
    attributeName === "v-slot" ||
    attributeName.startsWith("v-slot:")
  );
}

function isVueSfcBindingsAttribute(attribute, options) {
  const element = attribute.parent;
  if (!isVueSfcBlock(element, options)) {
    return false;
  }
  const tagName = element.fullName;
  const attributeName = attribute.fullName;

  return (
    // https://github.com/vuejs/rfcs/blob/sfc-improvements/active-rfcs/0000-sfc-script-setup.md
    (tagName === "script" && attributeName === "setup") ||
    // https://github.com/vuejs/rfcs/blob/sfc-improvements/active-rfcs/0000-sfc-style-variables.md
    (tagName === "style" && attributeName === "vars")
  );
}

function getTextValueParts(node, value = node.value) {
  return node.parent.isWhitespaceSensitive
    ? node.parent.isIndentationSensitive
      ? replaceEndOfLine(value)
      : replaceEndOfLine(
          htmlWhitespace.dedentString(htmlTrimPreserveIndentation(value)),
          hardline,
        )
    : join(line, htmlWhitespace.split(value));
}

function isVueScriptTag(node, options) {
  return isVueSfcBlock(node, options) && node.name === "script";
}

function isAttributeValueQuoted(node) {
  const { valueSpan, value } = node;
  return valueSpan.end.offset - valueSpan.start.offset === value.length + 2;
}

function shouldUnquoteAttributeValue(node, options) {
  if (isAttributeValueQuoted(node)) {
    return false;
  }

  const { value } = node;

  return (
    // Embedded HTML in JS: `` /* HTML */ `<my-element data-for={value}></my-element>` ``
    /^PRETTIER_HTML_PLACEHOLDER_\d+_\d+_IN_JS$/u.test(value) ||
    // LWC `<div foo={value}></div>`
    (options.parser === "lwc" && value.startsWith("{") && value.endsWith("}"))
  );
}

export {
  canHaveInterpolation,
  forceBreakChildren,
  forceBreakContent,
  forceNextEmptyLine,
  getLastDescendant,
  getLeadingAndTrailingHtmlWhitespace,
  getNodeCssStyleDisplay,
  getTextValueParts,
  getUnescapedAttributeValue,
  hasPrettierIgnore,
  htmlTrimPreserveIndentation,
  inferElementParser,
  isDanglingSpaceSensitiveNode,
  isIndentationSensitiveNode,
  isLeadingSpaceSensitiveNode,
  isPreLikeNode,
  isScriptLikeTag,
  isTextLikeNode,
  isTrailingSpaceSensitiveNode,
  isVueCustomBlock,
  isVueNonHtmlBlock,
  isVueScriptTag,
  isVueSfcBindingsAttribute,
  isVueSfcBlock,
  isVueSlotAttribute,
  isWhitespaceSensitiveNode,
  preferHardlineAsLeadingSpaces,
  shouldPreserveContent,
  shouldUnquoteAttributeValue,
  unescapeQuoteEntities,
};
