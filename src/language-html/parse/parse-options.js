import { TagContentType } from "angular-html-parser";

/**
@import {HtmlParseOptions} from "angular-html-parser"
@typedef {{filepath?: string}} Options
*/

/**
@typedef {Omit<HtmlParseOptions, "enableAngularSelectorlessSyntax"> & {
  name: 'html' | 'angular' | 'vue' | 'lwc' | 'mjml';
  normalizeTagName?: boolean;
  normalizeAttributeName?: boolean;
  shouldParseAsRawText?: (tagName: string, prefix: string, hasParent: boolean, attrs: {
    prefix: string;
    name: string;
    value?: string;
  }[]) => boolean;
  shouldParseFrontMatter?: boolean;
}} ParseOptions
*/

/**
@type {Omit<ParseOptions, "name">}
*/
const DEFAULT_PARSE_OPTIONS = {
  canSelfClose: true,
  normalizeTagName: false,
  normalizeAttributeName: false,
  allowHtmComponentClosingTags: false,
  allowStartTagComments: false,
  isTagNameCaseSensitive: false,
  shouldParseFrontMatter: true,
};

/**
@param {ParseOptions} rawParseOptions
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
@returns {HtmlParseOptions}
*/
function toAngularHtmlParserParseOptions(parseOptions) {
  const {
    canSelfClose,
    allowHtmComponentClosingTags,
    allowStartTagComments,
    isTagNameCaseSensitive,
    shouldParseAsRawText,
    tokenizeAngularBlocks,
    tokenizeAngularLetDeclaration,
  } = parseOptions;

  return {
    canSelfClose,
    allowHtmComponentClosingTags,
    allowStartTagComments,
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
