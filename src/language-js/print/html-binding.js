import {
  join,
  line,
  group,
  softline,
  indent,
} from "../../document/builders.js";

function printHtmlBinding(path, options, print) {
  const { node, isRoot } = path;

  if (isRoot) {
    options.__onHtmlBindingRoot?.(node, options);
  }

  if (node.type !== "File") {
    return;
  }

  if (options.__isVueBindings || options.__isVueForBindingLeft) {
    const parameterDocs = path.map(print, "program", "body", 0, "params");

    if (parameterDocs.length === 1) {
      return parameterDocs[0];
    }

    const doc = join([",", line], parameterDocs);

    return options.__isVueForBindingLeft
      ? ["(", indent([softline, group(doc)]), softline, ")"]
      : doc;
  }
}

// based on https://github.com/prettier/prettier/blob/main/src/language-html/syntax-vue.js isVueEventBindingExpression()
function isVueEventBindingExpression(node) {
  switch (node.type) {
    case "MemberExpression":
      switch (node.property.type) {
        case "Identifier":
        case "NumericLiteral":
        case "StringLiteral":
          return isVueEventBindingExpression(node.object);
      }
      return false;
    case "Identifier":
      return true;
    default:
      return false;
  }
}

export { isVueEventBindingExpression, printHtmlBinding };
