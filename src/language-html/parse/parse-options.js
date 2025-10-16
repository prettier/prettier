import { TagContentType } from "angular-html-parser";

/**
@import {ParseOptions as AngularHtmlParserParseOptions} from "angular-html-parser"
@typedef {{filepath?: string}} Options
*/

/**
@typedef {AngularHtmlParserParseOptions & {
  name: 'html' | 'angular' | 'vue' | 'lwc' | 'mjml';
  normalizeTagName?: boolean;
  normalizeAttributeName?: boolean;
  shouldParseAsRawText?: (tagName: string, prefix: string, hasParent: boolean, attrs: Array<{
    prefix: string;
    name: string;
    value?: string;
  }>) => boolean;
}} RawParseOptions

@typedef {RawParseOptions & typeof DEFAULT_PARSE_OPTIONS} ParseOptions
*/

const DEFAULT_PARSE_OPTIONS = {
  canSelfClose: true,
  normalizeTagName: false,
  normalizeAttributeName: false,
  allowHtmComponentClosingTags: false,
  isTagNameCaseSensitive: false,
  shouldParseFrontMatter: true,
};

/**
@param {RawParseOptions} rawParseOptions
@returns {ParseOptions}
*/
function normalizeParseOptions(rawParseOptions) {
  return {
    ...DEFAULT_PARSE_OPTIONS,
    ...rawParseOptions,
  };
}

/**
@param {ParseOptions} parseOptions
@returns {AngularHtmlParserParseOptions}
*/
function toAngularHtmlParserParseOptions(parseOptions) {
  const {
    canSelfClose,
    allowHtmComponentClosingTags,
    isTagNameCaseSensitive,
    shouldParseAsRawText,
    tokenizeAngularBlocks,
    tokenizeAngularLetDeclaration,
  } = parseOptions;

  return {
    canSelfClose,
    allowHtmComponentClosingTags,
    isTagNameCaseSensitive,
    getTagContentType: shouldParseAsRawText
      ? (...args) =>
          shouldParseAsRawText(...args) ? TagContentType.RAW_TEXT : undefined
      : undefined,
    tokenizeAngularBlocks,
    tokenizeAngularLetDeclaration,
  };
}

export { normalizeParseOptions, toAngularHtmlParserParseOptions };
