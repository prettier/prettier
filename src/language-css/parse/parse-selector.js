import PostcssSelectorParser from "postcss-selector-parser/dist/processor.js";
import { addTypePrefix } from "./utils.js";

function parseSelector(selector) {
  // If there's a comment inside of a selector, the parser tries to parse
  // the content of the comment as selectors which turns it into complete
  // garbage. Better to print the whole selector as-is and not try to parse
  // and reformat it.
  if (/\/\/|\/\*/u.test(selector)) {
    return {
      type: "selector-unknown",
      value: selector.trim(),
    };
  }

  let result;

  try {
    new PostcssSelectorParser((selectors) => {
      result = selectors;
    }).process(selector);
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
