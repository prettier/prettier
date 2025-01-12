const CATEGORY_COMMON = "Common";

// format based on https://github.com/prettier/prettier/blob/main/src/main/core-options.evaluate.js
const options = {
  bracketSpacing: {
    category: CATEGORY_COMMON,
    type: "boolean",
    default: true,
    description: "Print spaces between brackets.",
    oppositeDescription: "Do not print spaces between brackets.",
  },
  objectWrapping: {
    category: CATEGORY_COMMON,
    type: "choice",
    default: "preserve",
    description: "How to wrap object literals.",
    choices: [
      {
        value: "preserve",
        description:
          "Keep as multi-line, if there is a newline between the opening brace and first property.",
      },
      {
        value: "collapse",
        description: "Fit to a single line when possible.",
      },
    ],
  },
  singleQuote: {
    category: CATEGORY_COMMON,
    type: "boolean",
    default: false,
    description: "Use single quotes instead of double quotes.",
  },
  proseWrap: {
    category: CATEGORY_COMMON,
    type: "choice",
    default: "preserve",
    description: "How to wrap prose.",
    choices: [
      {
        value: "always",
        description: "Wrap prose if it exceeds the print width.",
      },
      {
        value: "never",
        description: "Do not wrap prose.",
      },
      {
        value: "preserve",
        description: "Wrap prose as-is.",
      },
    ],
  },
  bracketSameLine: {
    category: CATEGORY_COMMON,
    type: "boolean",
    default: false,
    description:
      "Put > of opening tags on the last line instead of on a new line.",
  },
  singleAttributePerLine: {
    category: CATEGORY_COMMON,
    type: "boolean",
    default: false,
    description: "Enforce single attribute per line in HTML, Vue and JSX.",
  },
};

export default options;
