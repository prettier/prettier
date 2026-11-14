import postcssSelectorParser from "postcss-selector-parser";
import { removeQuotedStrings } from "../print/misc.js";
import { addTypePrefix } from "./utilities.js";

function parseSelector(selector) {
  // If there's a comment inside of a selector, the parser tries to parse
  // the content of the comment as selectors which turns it into complete
  // garbage. Better to print the whole selector as-is and not try to parse
  // and reformat it.
  if (/\/[/*]/.test(removeQuotedStrings(selector))) {
    return {
      type: "selector-unknown",
      value: selector.trim(),
    };
  }

  let result;

  try {
    postcssSelectorParser((selectors) => {
      selectors.walk((node) => {
        if (node.type === "string" && node.value.startsWith("(")) {
          throw new Error("Unexpected parentheses");
        }
      });
      result = selectors;
    }).processSync(selector);
  } catch {
    // Fail silently. It's better to print it as is than to try and parse it
    // Note: A common failure is for SCSS nested properties. `background:
    // none { color: red; }` is parsed as a NestedDeclaration by
    // postcss-scss, while `background: { color: red; }` is parsed as a Rule
    // with a selector ending with a colon. See:
    // https://github.com/postcss/postcss-scss/issues/39
    return {
      type: "selector-unknown",
      value: selector,
    };
  }

  return addTypePrefix(result, "selector-");
}

export default parseSelector;
