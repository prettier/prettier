import {
  join,
  line,
  group,
  softline,
  indent,
} from "../../document/builders.js";

function printHtmlBinding(path, options, print) {
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

  if (options.__isEmbeddedTypescriptGenericParameters) {
    const parameterDocs = path.map(
      print,
      "program",
      "body",
      0,
      "typeParameters",
      "params",
    );

    return join([",", line], parameterDocs);
  }
}

export { printHtmlBinding };
