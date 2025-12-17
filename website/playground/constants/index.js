export const CATEGORIES_ORDER = [
  "Global",
  "Common",
  "JavaScript",
  "Markdown",
  "HTML",
  "Special",
];
export const ISSUES_URL =
  "https://github.com/prettier/prettier/issues/new?body=";
export const MAX_LENGTH = 8000 - ISSUES_URL.length; // it seems that GitHub limit is 8195
export const COPY_MESSAGE =
  "<!-- The issue body has been saved to the clipboard. Please paste it after this line! 👇 -->\n";

export const ENABLED_OPTIONS = [
  "parser",
  "printWidth",
  "tabWidth",
  "useTabs",
  "endOfLine",
  "semi",
  "singleQuote",
  "bracketSpacing",
  "jsxSingleQuote",
  "objectWrap",
  "quoteProps",
  "arrowParens",
  "trailingComma",
  "proseWrap",
  "htmlWhitespaceSensitivity",
  "insertPragma",
  "requirePragma",
  // TODO: Enable this after release 3.6
  // "checkIgnorePragma",
  "vueIndentScriptAndStyle",
  "embeddedLanguageFormatting",
  "bracketSameLine",
  "singleAttributePerLine",
  "experimentalTernaries",
  "experimentalOperatorPosition",
];

export const STORE_KEY = "playground_options";
