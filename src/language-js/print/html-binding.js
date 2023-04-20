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

export { printHtmlBinding };
