import parseFrontMatter from "../utils/front-matter/parse.js";
import inferParserByLanguage from "../utils/infer-parser-by-language.js";
import createError from "../common/parser-create-error.js";
import HTML_TAGS from "./utils/html-tag-names.evaluate.js";
import HTML_ELEMENT_ATTRIBUTES from "./utils/html-elements-attributes.evaluate.js";
import isUnknownNamespace from "./utils/is-unknown-namespace.js";
import { hasPragma } from "./pragma.js";
import { Node } from "./ast.js";
import { parseIeConditionalComment } from "./conditional-comment.js";
import { locStart, locEnd } from "./loc.js";

/**
 * @typedef {import('angular-html-parser')} AngularHtmlParser
 * @typedef {import('angular-html-parser/lib/compiler/src/ml_parser/ast.js').Node} AstNode
 * @typedef {import('angular-html-parser/lib/compiler/src/ml_parser/ast.js').Attribute} Attribute
 * @typedef {import('angular-html-parser/lib/compiler/src/ml_parser/ast.js').Element} Element
 * @typedef {import('angular-html-parser/lib/compiler/src/ml_parser/parser.js').ParseTreeResult} ParserTreeResult
 * @typedef {Omit<import('angular-html-parser').ParseOptions, 'canSelfClose'> & {
 *   name?: 'html' | 'angular' | 'vue' | 'lwc';
 *   recognizeSelfClosing?: boolean;
 *   normalizeTagName?: boolean;
 *   normalizeAttributeName?: boolean;
 *   shouldParseAsRawText?: (tagName: string, prefix: string, hasParent: boolean, attrs: Array<{
 *      prefix: string;
 *      name: string;
 *      value?: string;
 *   }>) => boolean;
 * }} ParserOptions
 * @typedef {{
 *   parser: 'html' | 'angular' | 'vue' | 'lwc',
 *   filepath?: string
 * }} Options
 */

/**
 * @param {AngularHtmlParser} angularHtmlParser
 * @param {string} input
 * @param {ParserOptions} parserOptions
 * @param {Options} options
 */
function ngHtmlParser(
  angularHtmlParser,
  input,
  {
    recognizeSelfClosing,
    normalizeTagName,
    normalizeAttributeName,
    allowHtmComponentClosingTags,
    isTagNameCaseSensitive,
    shouldParseAsRawText,
  },
  options
) {
  const {
    parse,
    RecursiveVisitor,
    visitAll,
    ParseSourceSpan,
    getHtmlTagDefinition,
    TagContentType,
  } = angularHtmlParser;

  let { rootNodes, errors } = parse(input, {
    canSelfClose: recognizeSelfClosing,
    allowHtmComponentClosingTags,
    isTagNameCaseSensitive,
    getTagContentType(tagName, prefix, hasParent, attrs) {
      if (shouldParseAsRawText?.(tagName, prefix, hasParent, attrs)) {
        return TagContentType.RAW_TEXT;
      }
    },
  });

  if (options.parser === "vue") {
    const isVueHtml = rootNodes.some(
      (node) =>
        (node.type === "docType" && node.value === "html") ||
        (node.type === "element" && node.name.toLowerCase() === "html")
    );

    if (!isVueHtml) {
      const shouldParseAsHTML = (/** @type {AstNode} */ node) => {
        /* c8 ignore next 3 */
        if (!node) {
          return false;
        }
        if (node.type !== "element" || node.name !== "template") {
          return false;
        }
        const language = node.attrs.find((attr) => attr.name === "lang")?.value;
        return !language || inferParserByLanguage(language, options) === "html";
      };
      if (rootNodes.some(shouldParseAsHTML)) {
        /** @type {ParserTreeResult | undefined} */
        let secondParseResult;
        const doSecondParse = () =>
          parse(input, {
            canSelfClose: recognizeSelfClosing,
            allowHtmComponentClosingTags,
            isTagNameCaseSensitive,
          });
        const getSecondParse = () => (secondParseResult ??= doSecondParse());
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
              /* c8 ignore next 4 */
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
      const htmlParseResult = parse(input, {
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
        node.name = lowerCaseIfFn(node.name, (lowerCasedName) =>
          HTML_TAGS.has(lowerCasedName)
        );
      }

      if (normalizeAttributeName) {
        for (const attr of node.attrs) {
          if (!attr.namespace) {
            attr.name = lowerCaseIfFn(
              attr.name,
              (lowerCasedAttrName) =>
                HTML_ELEMENT_ATTRIBUTES.has(node.name) &&
                (HTML_ELEMENT_ATTRIBUTES.get("*").has(lowerCasedAttrName) ||
                  HTML_ELEMENT_ATTRIBUTES.get(node.name).has(
                    lowerCasedAttrName
                  ))
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
 * @param {AngularHtmlParser} angularHtmlParser
 * @param {string} text
 * @param {Options} options
 * @param {ParserOptions} parserOptions
 * @param {boolean} shouldParseFrontMatter
 */
function _parse(
  angularHtmlParser,
  text,
  options,
  parserOptions,
  shouldParseFrontMatter = true
) {
  const { frontMatter, content } = shouldParseFrontMatter
    ? parseFrontMatter(text)
    : { frontMatter: null, content: text };

  const { ParseSourceFile, ParseLocation, ParseSourceSpan } = angularHtmlParser;

  const file = new ParseSourceFile(text, options.filepath);
  const start = new ParseLocation(file, 0, 0, 0);
  const end = start.moveBy(text.length);
  const rawAst = {
    type: "root",
    sourceSpan: new ParseSourceSpan(start, end),
    children: ngHtmlParser(angularHtmlParser, content, parserOptions, options),
  };

  if (frontMatter) {
    const start = new ParseLocation(file, 0, 0, 0);
    const end = start.moveBy(frontMatter.raw.length);
    frontMatter.sourceSpan = new ParseSourceSpan(start, end);
    // @ts-expect-error
    rawAst.children.unshift(frontMatter);
  }

  const ast = new Node(rawAst);

  const parseSubHtml = (subContent, startSpan) => {
    const { offset } = startSpan;
    const fakeContent = text.slice(0, offset).replaceAll(/[^\n\r]/g, " ");
    const realContent = subContent;
    const subAst = _parse(
      angularHtmlParser,
      fakeContent + realContent,
      options,
      parserOptions,
      false
    );
    // @ts-expect-error
    subAst.sourceSpan = new ParseSourceSpan(
      startSpan,
      // @ts-expect-error
      subAst.children.at(-1).sourceSpan.end
    );
    // @ts-expect-error
    const firstText = subAst.children[0];
    if (firstText.length === offset) {
      /* c8 ignore next */ // @ts-expect-error
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

  ast.walk((node) => {
    if (node.type === "comment") {
      const ieConditionalComment = parseIeConditionalComment(
        angularHtmlParser,
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
  shouldParseAsRawText,
} = {}) {
  return {
    async parse(text, options) {
      const angularHtmlParser = await import("angular-html-parser");
      return _parse(
        angularHtmlParser,
        text,
        { parser: name, ...options },
        {
          recognizeSelfClosing,
          normalizeTagName,
          normalizeAttributeName,
          allowHtmComponentClosingTags,
          isTagNameCaseSensitive,
          shouldParseAsRawText,
        }
      );
    },
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
      shouldParseAsRawText(tagName, prefix, hasParent, attrs) {
        return (
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
        );
      },
    }),
    lwc: createParser({ name: "lwc" }),
  },
};

export default parser;
