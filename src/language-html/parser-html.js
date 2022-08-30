import parseFrontMatter from "../utils/front-matter/parse.js";
import getLast from "../utils/get-last.js";
import createError from "../common/parser-create-error.js";
import { inferParserByLanguage } from "../common/util.js";
import HTML_TAGS from "./utils/html-tag-names.js";
import HTML_ELEMENT_ATTRIBUTES from "./utils/html-elements-attributes.js";
import isUnknownNamespace from "./utils/is-unknown-namespace.js";
import { hasPragma } from "./pragma.js";
import { Node } from "./ast.js";
import { parseIeConditionalComment } from "./conditional-comment.js";
import { locStart, locEnd } from "./loc.js";

/**
 * @typedef {import('angular-html-parser/lib/compiler/src/ml_parser/ast').Node} AstNode
 * @typedef {import('angular-html-parser/lib/compiler/src/ml_parser/ast').Attribute} Attribute
 * @typedef {import('angular-html-parser/lib/compiler/src/ml_parser/ast').Element} Element
 * @typedef {import('angular-html-parser/lib/compiler/src/ml_parser/parser').ParseTreeResult} ParserTreeResult
 * @typedef {Omit<import('angular-html-parser').ParseOptions, 'canSelfClose'> & {
 *   name?: 'html' | 'angular' | 'vue' | 'lwc';
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
async function ngHtmlParser(
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
  const [
    parser,
    { RecursiveVisitor, visitAll },
    { ParseSourceSpan },
    { getHtmlTagDefinition },
  ] = await Promise.all([
    import("angular-html-parser"),
    import("angular-html-parser/lib/compiler/src/ml_parser/ast.js"),
    import("angular-html-parser/lib/compiler/src/parse_util.js"),
    import("angular-html-parser/lib/compiler/src/ml_parser/html_tags.js"),
  ]);

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
    const [error] = errors;
    const {
      msg,
      span: { start, end },
    } = error;
    throw createError(msg, {
      loc: {
        start: { line: start.line + 1, column: start.col + 1 },
        end: { line: end.line + 1, column: end.col + 1 },
      },
      cause: error,
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
    switch (node.type) {
      case "element":
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
        break;
      case "comment":
        node.value = node.sourceSpan
          .toString()
          .slice("<!--".length, -"-->".length);
        break;
      case "text":
        node.value = node.sourceSpan.toString();
        break;
      // No default
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
async function _parse(
  text,
  options,
  parserOptions,
  shouldParseFrontMatter = true
) {
  const { frontMatter, content } = shouldParseFrontMatter
    ? parseFrontMatter(text)
    : { frontMatter: null, content: text };

  const { ParseSourceSpan, ParseLocation, ParseSourceFile } = await import(
    "angular-html-parser/lib/compiler/src/parse_util.js"
  );

  const file = new ParseSourceFile(text, options.filepath);
  const start = new ParseLocation(file, 0, 0, 0);
  const end = start.moveBy(text.length);
  const rawAst = {
    type: "root",
    sourceSpan: new ParseSourceSpan(start, end),
    children: await ngHtmlParser(content, parserOptions, options),
  };

  if (frontMatter) {
    const start = new ParseLocation(file, 0, 0, 0);
    const end = start.moveBy(frontMatter.raw.length);
    frontMatter.sourceSpan = new ParseSourceSpan(start, end);
    // @ts-expect-error
    rawAst.children.unshift(frontMatter);
  }

  const ast = new Node(rawAst);

  const parseSubHtml = async (subContent, startSpan) => {
    const { offset } = startSpan;
    const fakeContent = text.slice(0, offset).replace(/[^\n\r]/g, " ");
    const realContent = subContent;
    const subAst = await _parse(
      fakeContent + realContent,
      options,
      parserOptions,
      false
    );
    // @ts-expect-error
    subAst.sourceSpan = new ParseSourceSpan(
      startSpan,
      // @ts-expect-error
      getLast(subAst.children).sourceSpan.end
    );
    // @ts-expect-error
    const firstText = subAst.children[0];
    if (firstText.length === offset) {
      /* istanbul ignore next */ // @ts-expect-error
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

  await ast.walkAsync(async (node) => {
    if (node.type === "comment") {
      const ieConditionalComment = await parseIeConditionalComment(
        node,
        parseSubHtml
      );
      if (ieConditionalComment) {
        node.parent.replaceChild(node, ieConditionalComment);
      }
    }
  });

  return ast;
}

/**
 * @param {ParserOptions} parserOptions
 */
function createParser({
  name,
  recognizeSelfClosing = false,
  normalizeTagName = false,
  normalizeAttributeName = false,
  allowHtmComponentClosingTags = false,
  isTagNameCaseSensitive = false,
  getTagContentType,
} = {}) {
  return {
    parse: (text, options) =>
      _parse(
        text,
        { parser: name, ...options },
        {
          recognizeSelfClosing,
          normalizeTagName,
          normalizeAttributeName,
          allowHtmComponentClosingTags,
          isTagNameCaseSensitive,
          getTagContentType,
        }
      ),
    hasPragma,
    astFormat: "html",
    locStart,
    locEnd,
  };
}

const parser = {
  parsers: {
    html: createParser({
      name: "html",
      recognizeSelfClosing: true,
      normalizeTagName: true,
      normalizeAttributeName: true,
      allowHtmComponentClosingTags: true,
    }),
    angular: createParser({ name: "angular" }),
    vue: createParser({
      name: "vue",
      recognizeSelfClosing: true,
      isTagNameCaseSensitive: true,
      getTagContentType: (tagName, prefix, hasParent, attrs) => {
        if (
          tagName.toLowerCase() !== "html" &&
          !hasParent &&
          (tagName !== "template" ||
            attrs.some(
              ({ name, value }) =>
                name === "lang" &&
                value !== "html" &&
                value !== "" &&
                value !== undefined
            ))
        ) {
          // require("angular-html-parser").TagContentType.RAW_TEXT;
          return 0;
        }
      },
    }),
    lwc: createParser({ name: "lwc" }),
  },
};

export default parser;
