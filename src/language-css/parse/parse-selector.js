import PostcssSelectorParser from "postcss-selector-parser/dist/processor.js";

import { addTypePrefix } from "./utils.js";

const commentRegExp = /\/\/|\/\*/;

function parseSelector(selector) {
  /** @type {any} */
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

  if (result) {
    // If there's a comment inside of a selector, the parser tries to parse
    // the content of the comment as selectors which turns it into complete
    // garbage. Better to print the whole selector as-is and not try to parse
    // and reformat it.
    let foundComments;
    result.walk((x) => {
      if (x.type === "comment") {
        foundComments = true;
        return false;
      }

      if (x.type === "tag" && x.value === "//") {
        foundComments = true;
        return false;
      }

      if (x.type === "attribute") {
        if (commentRegExp.test(x.attribute)) {
          foundComments = true;
          return false;
        }

        if (commentRegExp.test(x.namespace)) {
          foundComments = true;
          return false;
        }

        if (commentRegExp.test(x.value)) {
          if (x.quoted === false) {
            foundComments = true;
            return false;
          }

          try {
            // Re-parse the attribute value as a selector.
            // It will either be an ident or a string, possibly interleaved with comments.
            new PostcssSelectorParser((attributeBits) => {
              attributeBits.walk((y) => {
                if (y.type === "comment") {
                  foundComments = true;
                  return false;
                }

                if (y.type === "tag" && x.value === "//") {
                  foundComments = true;
                  return false;
                }
              });
            }).process(x.value);
          } catch {
            return {
              type: "selector-unknown",
              value: selector,
            };
          }
        }
      }
    });

    if (foundComments) {
      return {
        type: "selector-unknown",
        value: selector.trim(),
      };
    }
  }

  return addTypePrefix(result, "selector-");
}

export default parseSelector;
