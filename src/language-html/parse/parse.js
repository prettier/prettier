import {
  parse as angularHtmlParserParse,
  ParseLocation,
  ParseSourceFile,
  ParseSourceSpan,
} from "angular-html-parser";
import createError from "../../common/parser-create-error.js";
import { parseFrontMatter } from "../../main/front-matter/index.js";
import replaceNonLineBreaksWithSpace from "../../utilities/replace-non-line-breaks-with-space.js";
import {
  normalizeParseOptions,
  toAngularHtmlParserParseOptions,
} from "./parse-options.js";
import { postprocess } from "./postprocess.js";

/**
@import {ParseOptions as AngularHtmlParserParseOptions, Ast, ParseTreeResult} from "angular-html-parser";
@import {RawParseOptions, ParseOptions} from "./parse-options.js";
@import {FrontMatter} from "../../main/front-matter/parse.js"
@typedef {{filepath?: string}} Options
@typedef {FrontMatter & {kind: "frontMatter", sourceSpan: ParseSourceSpan}} HtmlFrontMatter
*/

/**
@param {string} input
@param {ParseOptions} parseOptions
*/
function parseHtml(input, parseOptions) {
  const { rootNodes, errors } = angularHtmlParserParse(
    input,
    toAngularHtmlParserParseOptions(parseOptions),
  );

  if (errors.length > 0) {
    throwParseError(errors[0]);
  }

  return { parseOptions, rootNodes };
}

/**
@param {string} input
@param {ParseOptions} parseOptions
*/
function parseVue(input, parseOptions) {
  const angularHtmlParserParseOptions =
    toAngularHtmlParserParseOptions(parseOptions);
  let { rootNodes, errors } = angularHtmlParserParse(
    input,
    angularHtmlParserParseOptions,
  );

  const isHtml = rootNodes.some(
    (node) =>
      (node.kind === "docType" && node.value === "html") ||
      (node.kind === "element" && node.name.toLowerCase() === "html"),
  );

  // If not Vue SFC, treat as html
  if (isHtml) {
    return parseHtml(input, HTML_PARSE_OPTIONS);
  }

  /** @type {ParseTreeResult | undefined} */
  let secondParseResult;
  const getHtmlParseResult = () =>
    (secondParseResult ??= angularHtmlParserParse(input, {
      ...angularHtmlParserParseOptions,
      getTagContentType: undefined,
    }));

  const getElementWithSameLocation = (node) => {
    const { offset } = node.startSourceSpan.start;
    return (
      getHtmlParseResult().rootNodes.find(
        (searching) =>
          searching.kind === "element" &&
          searching.startSourceSpan.start.offset === offset,
      ) ?? node
    );
  };
  for (const [index, node] of rootNodes.entries()) {
    if (node.kind !== "element") {
      continue;
    }

    if (node.isVoid) {
      errors = getHtmlParseResult().errors;
      rootNodes[index] = getElementWithSameLocation(node);
    } else if (shouldParseVueRootNodeAsHtml(node)) {
      const { endSourceSpan, startSourceSpan } = node;
      const error = getHtmlParseResult().errors.find(
        (error) =>
          error.span.start.offset > startSourceSpan.start.offset &&
          error.span.start.offset < endSourceSpan.end.offset,
      );
      if (error) {
        throwParseError(error);
      }
      rootNodes[index] = getElementWithSameLocation(node);
    }
  }

  if (errors.length > 0) {
    throwParseError(errors[0]);
  }

  return { parseOptions, rootNodes };
}

/**
@param {Ast.Node} node
@returns {boolean}
*/
function shouldParseVueRootNodeAsHtml(node) {
  if (node.kind !== "element" || node.name !== "template") {
    return false;
  }
  const language = node.attrs.find((attr) => attr.name === "lang")?.value;
  return !language || language === "html";
}

function throwParseError(error) {
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

function parseSubHtml(
  parser,
  text,
  subContent,
  startSpan,
  parseOptions,
  options,
) {
  const { offset } = startSpan;
  const textToParse =
    replaceNonLineBreaksWithSpace(text.slice(0, offset)) + subContent;
  const subAst = parse(
    textToParse,
    parser,
    { ...parseOptions, shouldParseFrontMatter: false },
    options,
  );

  // @ts-expect-error
  subAst.sourceSpan = new ParseSourceSpan(
    startSpan,
    // @ts-expect-error
    subAst.children.at(-1).sourceSpan.end,
  );
  // @ts-expect-error
  const firstText = subAst.children[0];
  if (firstText.length === offset) {
    /* c8 ignore next */ // @ts-expect-error
    subAst.children.shift();
  } else {
    firstText.sourceSpan = new ParseSourceSpan(
      firstText.sourceSpan.start.moveBy(offset),
      firstText.sourceSpan.end,
    );
    firstText.value = firstText.value.slice(offset);
  }
  return subAst;
}

/**
@param {string} text
@param {typeof parseHtml | typeof parseVue} parser
@param {ParseOptions} parseOptions
@param {Options} options
*/
function parse(text, parser, parseOptions, options = {}) {
  const { frontMatter, content: textToParse } =
    parseOptions.shouldParseFrontMatter
      ? parseFrontMatter(text)
      : { content: text };

  const file = new ParseSourceFile(text, options.filepath);
  const start = new ParseLocation(file, 0, 0, 0);
  const end = start.moveBy(text.length);

  const { parseOptions: actualParseOptions, rootNodes } = parser(
    textToParse,
    parseOptions,
  );

  const rawAst = {
    kind: "root",
    sourceSpan: new ParseSourceSpan(start, end),
    children: rootNodes,
  };

  /** @type {HtmlFrontMatter} */
  let htmlFrontMatter;
  if (frontMatter) {
    const [start, end] = [frontMatter.start, frontMatter.end].map(
      (location) =>
        new ParseLocation(
          file,
          location.index,
          location.line - 1,
          location.column,
        ),
    );
    htmlFrontMatter = {
      ...frontMatter,
      kind: "frontMatter",
      sourceSpan: new ParseSourceSpan(start, end),
    };
  }

  const ast = postprocess(
    rawAst,
    htmlFrontMatter,
    actualParseOptions,
    (subContent, startSpan) =>
      parseSubHtml(
        parser,
        text,
        subContent,
        startSpan,
        actualParseOptions,
        options,
      ),
  );

  return ast;
}

/** @type {ParseOptions} */
const HTML_PARSE_OPTIONS = normalizeParseOptions({
  name: "html",
  normalizeTagName: true,
  normalizeAttributeName: true,
  allowHtmComponentClosingTags: true,
});

export { HTML_PARSE_OPTIONS, parse, parseHtml, parseVue };
