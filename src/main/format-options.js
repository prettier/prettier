import {CATEGORY_FORMAT} from "./option-categories.js"

// format based on https://github.com/prettier/prettier/blob/main/src/main/core-options.js
const options = {
  bracketSpacing: {
    category: CATEGORY_FORMAT,
    type: "boolean",
    default: true,
    description: "Print spaces between brackets.",
    oppositeDescription: "Do not print spaces between brackets.",
  },
  singleQuote: {
    category: CATEGORY_FORMAT,
    type: "boolean",
    default: false,
    description: "Use single quotes instead of double quotes.",
  },
  proseWrap: {
    category: CATEGORY_FORMAT,
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
    category: CATEGORY_FORMAT,
    type: "boolean",
    default: false,
    description:
      "Put > of opening tags on the last line instead of on a new line.",
  },
  singleAttributePerLine: {
    category: CATEGORY_FORMAT,
    type: "boolean",
    default: false,
    description: "Enforce single attribute per line in HTML, Vue and JSX.",
  },
};

export default options;
