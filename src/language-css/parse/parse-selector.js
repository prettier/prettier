import postcssSelectorParser from "postcss-selector-parser";
import { hasSelectorComment } from "../print/misc.js";
import { addTypePrefix } from "./utilities.js";

function isInvalidAst(ast, selector) {
  return (
    !ast ||
    // https://github.com/postcss/postcss-selector-parser/issues/366
    String(ast) !== selector ||
    // https://github.com/postcss/postcss-selector-parser/issues/370
    ast.walk((node) =>
      node.type === "string" && node.value.startsWith("(") ? false : undefined,
    ) === false
  );
}

function parseSelector(selector) {
  // The selector parser does not support Less and SCSS line comments.
  if (hasSelectorComment(selector, "//")) {
    return {
      type: "selector-unknown",
      value: selector.trim(),
    };
  }

  let result;

  try {
    result = postcssSelectorParser().astSync(selector);
  } catch {
    // No op
  }

  // Fail silently. It's better to print it as is than to try and parse it
  // Note: A common failure is for SCSS nested properties. `background:
  // none { color: red; }` is parsed as a NestedDeclaration by
  // postcss-scss, while `background: { color: red; }` is parsed as a Rule
  // with a selector ending with a colon. See:
  // https://github.com/postcss/postcss-scss/issues/39
  if (isInvalidAst(result, selector)) {
    return {
      type: "selector-unknown",
      value: selector,
    };
  }

  return addTypePrefix(result, "selector-");
}

export default parseSelector;
