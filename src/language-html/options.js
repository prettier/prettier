import commonOptions from "../common/common-options.evaluate.js";

const CATEGORY_HTML = "HTML";

// format based on https://github.com/prettier/prettier/blob/main/src/main/core-options.evaluate.js
const options = {
  bracketSameLine: commonOptions.bracketSameLine,
  htmlWhitespaceSensitivity: {
    category: CATEGORY_HTML,
    type: "choice",
    default: "css",
    description: "How to handle whitespaces in HTML.",
    choices: [
      {
        value: "css",
        description: "Respect the default value of CSS display property.",
      },
      {
        value: "strict",
        description: "Whitespaces are considered sensitive.",
      },
      {
        value: "ignore",
        description: "Whitespaces are considered insensitive.",
      },
    ],
  },
  singleAttributePerLine: commonOptions.singleAttributePerLine,
  vueIndentScriptAndStyle: {
    category: CATEGORY_HTML,
    type: "boolean",
    default: false,
    description: "Indent script and style tags in Vue files.",
  },
  angularControlFlowSyntax: {
    category: CATEGORY_HTML,
    type: "boolean",
    default: true,
    description: "Format Angular's control flow syntax.",
  },
};

export default options;
