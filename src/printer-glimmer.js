"use strict";

// const util = require("./util");
const docBuilders = require("./doc-builders");
const concat = docBuilders.concat;
const join = docBuilders.join;
// const line = docBuilders.line;
const softline = docBuilders.softline;
const hardline = docBuilders.softline;
// const group = docBuilders.group;
const indent = docBuilders.indent;

function genericPrint(path, options, print) {
  const n = path.getValue();

  if (!n) {
    return "";
  }

  if (typeof n === "string") {
    return n;
  }

  switch (n.type) {
    case "Program": {
      return join(softline, path.map(print, "body"));
    }
    case "AttrNode": {
      return concat([n.name, '="', path.call(print, "value"), '"']);
    }
    case "BlockStatement": {
      return concat([
        "{{#",
        path.call(print, "path"),
        " ",
        join(" ", path.map(print, "params")),
        n.hash.pairs.length ? " " : "",
        path.call(print, "hash"),
        // TODO: Why isn't the "as |foo|" in the AST?
        "}}",
        indent(concat([hardline, path.call(print, "program")])),
        softline,
        "{{/",
        path.call(print, "path"),
        "}}"
      ]);
    }
    case "ConcatStatement": {
      return concat(path.map(print, "parts"));
    }
    case "CommentStatement": {
      return concat(["<!--", n.value, "-->"]);
    }
    case "ElementNode": {
      return concat([
        "<",
        n.tag,
        n.attributes.length ? " " : "",
        join(" ", path.map(print, "attributes")),
        n.children.length ? ">" : " />",
        indent(concat([softline, join(softline, path.map(print, "children"))])),
        n.children.length ? concat([softline, "</", n.tag, ">"]) : ""
      ]);
    }
    case "Hash": {
      return join(" ", path.map(print, "pairs"));
    }
    case "HashPair": {
      return concat([n.key, "=", path.call(print, "value")]);
    }
    case "MustacheStatement": {
      return concat(["{{", path.call(print, "path"), "}}"]);
    }
    case "MustacheCommentStatement": {
      const dashes = n.value.indexOf("}}") > -1 ? "--" : "";
      return concat(["{{!", dashes, n.value, dashes, "}}"]);
    }
    case "PathExpression": {
      return concat([n.data ? "@" : "", join(" ", path.map(print, "parts"))]);
    }
    case "StringLiteral": {
      return concat(['"', n.value, '"']);
    }
    case "TextNode": {
      return n.chars.trim();
    }
    default:
      throw new Error("unknown glimmer type: " + JSON.stringify(n.type));
  }
}

module.exports = genericPrint;
