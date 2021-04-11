"use strict";

const {
  ParseSourceSpan,
  ParseLocation,
  ParseSourceFile,
} = require("angular-html-parser/lib/compiler/src/parse_util");
const parseFrontMatter = require("../utils/front-matter/parse");
const getLast = require("../utils/get-last");
const createError = require("../common/parser-create-error");
const { inferParserByLanguage } = require("../common/util");
const {
  HTML_ELEMENT_ATTRIBUTES,
  HTML_TAGS,
  isUnknownNamespace,
} = require("./utils");
const { hasPragma } = require("./pragma");
const { Node } = require("./ast");
const { parseIeConditionalComment } = require("./conditional-comment");
const { locStart, locEnd } = require("./loc");

/**
 * @typedef {import('angular-html-parser/lib/compiler/src/ml_parser/ast').Node} AstNode
 * @typedef {import('angular-html-parser/lib/compiler/src/ml_parser/ast').Attribute} Attribute
 * @typedef {import('angular-html-parser/lib/compiler/src/ml_parser/ast').Element} Element
 * @typedef {import('angular-html-parser/lib/compiler/src/ml_parser/parser').ParseTreeResult} ParserTreeResult
 * @typedef {Omit<import('angular-html-parser').ParseOptions, 'canSelfClose'> & {
 *   recognizeSelfClosing?: boolean;
 *   normalizeTagName?: boolean;
 *   normalizeAttributeName?: boolean;
 * }} ParserOptions
 * @typedef {{
 *   parser: 'html' | 'angular' | 'vue' | 'lwc',
 *   filepath?: string
 * }} Options
 */

/**
 * @param {string} input
 * @param {ParserOptions} parserOptions
 * @param {Options} options
 */
function ngHtmlParser(
  input,
  {
    recognizeSelfClosing,
    normalizeTagName,
    normalizeAttributeName,
    allowHtmComponentClosingTags,
    isTagNameCaseSensitive,
    getTagContentType,
  },
  options
) {
  const parser = require("angular-html-parser");
  const {
    RecursiveVisitor,
    visitAll,
  } = require("angular-html-parser/lib/compiler/src/ml_parser/ast");
  const {
    ParseSourceSpan,
  } = require("angular-html-parser/lib/compiler/src/parse_util");
  const {
    getHtmlTagDefinition,
  } = require("angular-html-parser/lib/compiler/src/ml_parser/html_tags");

  let { rootNodes, errors } = parser.parse(input, {
    canSelfClose: recognizeSelfClosing,
    allowHtmComponentClosingTags,
    isTagNameCaseSensitive,
    getTagContentType,
  });

  if (options.parser === "vue") {
    const isVueHtml = rootNodes.some(
      (node) =>
        (node.type === "docType" && node.value === "html") ||
        (node.type === "element" && node.name.toLowerCase() === "html")
    );

    if (!isVueHtml) {
      const shouldParseAsHTML = (/** @type {AstNode} */ node) => {
        /* istanbul ignore next */
        if (!node) {
          return false;
        }
        if (node.type !== "element" || node.name !== "template") {
          return false;
        }
        const langAttr = node.attrs.find((attr) => attr.name === "lang");
        const langValue = langAttr && langAttr.value;
        return (
          !langValue || inferParserByLanguage(langValue, options) === "html"
        );
      };
      if (rootNodes.some(shouldParseAsHTML)) {
        /** @type {ParserTreeResult | undefined} */
        let secondParseResult;
        const doSecondParse = () =>
          parser.parse(input, {
            canSelfClose: recognizeSelfClosing,
            allowHtmComponentClosingTags,
            isTagNameCaseSensitive,
          });
        const getSecondParse = () =>
          secondParseResult || (secondParseResult = doSecondParse());
        const getSameLocationNode = (node) =>
          getSecondParse().rootNodes.find(
            ({ startSourceSpan }) =>
              startSourceSpan &&
              startSourceSpan.start.offset === node.startSourceSpan.start.offset
          );
        for (let i = 0; i < rootNodes.length; i++) {
          const node = rootNodes[i];
          const { endSourceSpan, startSourceSpan } = node;
          const isUnclosedNode = endSourceSpan === null;
          if (isUnclosedNode) {
            const result = getSecondParse();
            errors = result.errors;
            rootNodes[i] = getSameLocationNode(node) || node;
          } else if (shouldParseAsHTML(node)) {
            const result = getSecondParse();
            const startOffset = startSourceSpan.end.offset;
            const endOffset = endSourceSpan.start.offset;
            for (const error of result.errors) {
              const { offset } = error.span.start;
              /* istanbul ignore next */
              if (startOffset < offset && offset < endOffset) {
                errors = [error];
                break;
              }
            }
            rootNodes[i] = getSameLocationNode(node) || node;
          }
        }
      }
    } else {
      // If not Vue SFC, treat as html
      recognizeSelfClosing = true;
      normalizeTagName = true;
      normalizeAttributeName = true;
      allowHtmComponentClosingTags = true;
      isTagNameCaseSensitive = false;
      const htmlParseResult = parser.parse(input, {
        canSelfClose: recognizeSelfClosing,
        allowHtmComponentClosingTags,
        isTagNameCaseSensitive,
      });

      rootNodes = htmlParseResult.rootNodes;
      errors = htmlParseResult.errors;
    }
  }

  if (errors.length > 0) {
    const {
      msg,
      span: { start, end },
    } = errors[0];
    throw createError(msg, {
      start: { line: start.line + 1, column: start.col + 1 },
      end: { line: end.line + 1, column: end.col + 1 },
    });
  }

  /**
   * @param {Attribute | Element} node
   */
  const restoreName = (node) => {
    const namespace = node.name.startsWith(":")
      ? node.name.slice(1).split(":")[0]
      : null;
    const rawName = node.nameSpan.toString();
    const hasExplicitNamespace =
      namespace !== null && rawName.startsWith(`${namespace}:`);
    const name = hasExplicitNamespace
      ? rawName.slice(namespace.length + 1)
      : rawName;

    node.name = name;
    node.namespace = namespace;
    node.hasExplicitNamespace = hasExplicitNamespace;
  };

  /**
   * @param {AstNode} node
   */
  const restoreNameAndValue = (node) => {
    if (node.type === "element") {
      restoreName(node);
      for (const attr of node.attrs) {
        restoreName(attr);
        if (!attr.valueSpan) {
          attr.value = null;
        } else {
          attr.value = attr.valueSpan.toString();
          if (/["']/.test(attr.value[0])) {
            attr.value = attr.value.slice(1, -1);
          }
        }
      }
    } else if (node.type === "comment") {
      node.value = node.sourceSpan
        .toString()
        .slice("<!--".length, -"-->".length);
    } else if (node.type === "text") {
      node.value = node.sourceSpan.toString();
    }
  };

  const lowerCaseIfFn = (text, fn) => {
    const lowerCasedText = text.toLowerCase();
    return fn(lowerCasedText) ? lowerCasedText : text;
  };
  const normalizeName = (node) => {
    if (node.type === "element") {
      if (
        normalizeTagName &&
        (!node.namespace ||
          node.namespace === node.tagDefinition.implicitNamespacePrefix ||
          isUnknownNamespace(node))
      ) {
        node.name = lowerCaseIfFn(
          node.name,
          (lowerCasedName) => lowerCasedName in HTML_TAGS
        );
      }

      if (normalizeAttributeName) {
        const CURRENT_HTML_ELEMENT_ATTRIBUTES =
          HTML_ELEMENT_ATTRIBUTES[node.name] || Object.create(null);
        for (const attr of node.attrs) {
          if (!attr.namespace) {
            attr.name = lowerCaseIfFn(
              attr.name,
              (lowerCasedAttrName) =>
                node.name in HTML_ELEMENT_ATTRIBUTES &&
                (lowerCasedAttrName in HTML_ELEMENT_ATTRIBUTES["*"] ||
                  lowerCasedAttrName in CURRENT_HTML_ELEMENT_ATTRIBUTES)
            );
          }
        }
      }
    }
  };

  const fixSourceSpan = (node) => {
    if (node.sourceSpan && node.endSourceSpan) {
      node.sourceSpan = new ParseSourceSpan(
        node.sourceSpan.start,
        node.endSourceSpan.end
      );
    }
  };

  /**
   * @param {AstNode} node
   */
  const addTagDefinition = (node) => {
    if (node.type === "element") {
      const tagDefinition = getHtmlTagDefinition(
        isTagNameCaseSensitive ? node.name : node.name.toLowerCase()
      );
      if (
        !node.namespace ||
        node.namespace === tagDefinition.implicitNamespacePrefix ||
        isUnknownNamespace(node)
      ) {
        node.tagDefinition = tagDefinition;
      } else {
        node.tagDefinition = getHtmlTagDefinition(""); // the default one
      }
    }
  };

  visitAll(
    new (class extends RecursiveVisitor {
      visit(node) {
        restoreNameAndValue(node);
        addTagDefinition(node);
        normalizeName(node);
        fixSourceSpan(node);
      }
    })(),
    rootNodes
  );

  return rootNodes;
}

/**
 * @param {string} text
 * @param {Options} options
 * @param {ParserOptions} parserOptions
 * @param {boolean} shouldParseFrontMatter
 */
function _parse(text, options, parserOptions, shouldParseFrontMatter = true) {
  const { frontMatter, content } = shouldParseFrontMatter
    ? parseFrontMatter(text)
    : { frontMatter: null, content: text };

  const file = new ParseSourceFile(text, options.filepath);
  const start = new ParseLocation(file, 0, 0, 0);
  const end = start.moveBy(text.length);
  const rawAst = {
    type: "root",
    sourceSpan: new ParseSourceSpan(start, end),
    children: ngHtmlParser(content, parserOptions, options),
  };

  if (frontMatter) {
    const start = new ParseLocation(file, 0, 0, 0);
    const end = start.moveBy(frontMatter.raw.length);
    frontMatter.sourceSpan = new ParseSourceSpan(start, end);
    // @ts-ignore
    rawAst.children.unshift(frontMatter);
  }

  const ast = new Node(rawAst);

  const parseSubHtml = (subContent, startSpan) => {
    const { offset } = startSpan;
    const fakeContent = text.slice(0, offset).replace(/[^\n\r]/g, " ");
    const realContent = subContent;
    const subAst = _parse(
      fakeContent + realContent,
      options,
      parserOptions,
      false
    );
    subAst.sourceSpan = new ParseSourceSpan(
      startSpan,
      getLast(subAst.children).sourceSpan.end
    );
    const firstText = subAst.children[0];
    if (firstText.length === offset) {
      /* istanbul ignore next */
      subAst.children.shift();
    } else {
      firstText.sourceSpan = new ParseSourceSpan(
        firstText.sourceSpan.start.moveBy(offset),
        firstText.sourceSpan.end
      );
      firstText.value = firstText.value.slice(offset);
    }
    return subAst;
  };

  return ast.map((node) => {
    if (node.type === "comment") {
      const ieConditionalComment = parseIeConditionalComment(
        node,
        parseSubHtml
      );
      if (ieConditionalComment) {
        return ieConditionalComment;
      }
    }

    return node;
  });
}

/**
 * @param {ParserOptions} parserOptions
 */
function createParser({
  recognizeSelfClosing = false,
  normalizeTagName = false,
  normalizeAttributeName = false,
  allowHtmComponentClosingTags = false,
  isTagNameCaseSensitive = false,
  getTagContentType,
} = {}) {
  return {
    parse: (text, parsers, options) =>
      _parse(text, options, {
        recognizeSelfClosing,
        normalizeTagName,
        normalizeAttributeName,
        allowHtmComponentClosingTags,
        isTagNameCaseSensitive,
        getTagContentType,
      }),
    hasPragma,
    astFormat: "html",
    locStart,
    locEnd,
  };
}

module.exports = {
  parsers: {
    html: createParser({
      recognizeSelfClosing: true,
      normalizeTagName: true,
      normalizeAttributeName: true,
      allowHtmComponentClosingTags: true,
    }),
    angular: createParser(),
    vue: createParser({
      recognizeSelfClosing: true,
      isTagNameCaseSensitive: true,
      getTagContentType: (tagName, prefix, hasParent, attrs) => {
        if (
          tagName.toLowerCase() !== "html" &&
          !hasParent &&
          (tagName !== "template" ||
            attrs.some(
              ({ name, value }) => name === "lang" && value !== "html"
            ))
        ) {
          return require("angular-html-parser").TagContentType.RAW_TEXT;
        }
      },
    }),
    lwc: createParser(),
  },
};
