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

// https://github.com/glimmerjs/glimmer-vm/blob/master/packages/%40glimmer/syntax/lib/generation/print.ts

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
    case "ElementNode": {
      return concat([
        "<",
        n.tag,
        n.attributes.length ? " " : "",
        join(" ", path.map(print, "attributes")),

        n.modifiers.length ? " " : "",
        join(" ", path.map(print, "modifiers")),

        n.comments.length ? " " : "",
        join(" ", path.map(print, "comments")),

        n.children.length ? ">" : " />",

        indent(concat([softline, join(softline, path.map(print, "children"))])),
        n.children.length ? concat([softline, "</", n.tag, ">"]) : ""
      ]);
    }
    case "AttrNode": {
      const quote = n.value.type === "TextNode" ? '"' : "";
      return concat([n.name, "=", quote, path.call(print, "value"), quote]);
    }
    case "ConcatStatement": {
      return concat([
        '"',
        concat(
          path.map(partPath => {
            const part = partPath.getValue();
            if (part.type === "StringLiteral") {
              return part.original;
            }
            return print(partPath);
          }, "parts")
        ),
        '"'
      ]);
    }
    case "TextNode": {
      return n.chars.trim();
    }
    case "ElementModifierStatement":
    case "MustacheStatement": {
      return concat([
        n.escaped ? "{{" : "{{{",
        printPathParams(path, print),
        n.escaped ? "}}" : "}}}"
      ]);
    }
    case "MustacheCommentStatement": {
      const dashes = n.value.indexOf("}}") > -1 ? "--" : "";
      return concat(["{{!", dashes, n.value, dashes, "}}"]);
    }
    case "PathExpression": {
      return n.original;
    }
    case "SubExpression": {
      return concat(["(", printPathParams(path, print), ")"]);
    }
    case "BooleanLiteral": {
      return String(n.value);
    }
    case "BlockStatement": {
      const pp = path.getParentNode(1);
      const isElseIf = pp && pp.inverse && pp.inverse.body[0] === n;
      const hasElseIf =
        n.inverse &&
        n.inverse.body[0] &&
        n.inverse.body[0].type === "BlockStatement";
      return concat([
        isElseIf
          ? concat([softline, "{{else ", printPathParams(path, print), "}}"])
          : printOpenBlock(path, print),
        indent(concat([hardline, path.call(print, "program")])),
        !n.inverse || hasElseIf ? "" : concat([softline, "{{else}}"]),
        n.inverse
          ? indent(concat([hardline, path.call(print, "inverse")]))
          : "",
        hardline,
        isElseIf ? "" : printCloseBlock(path, print)
      ]);
    }
    case "PartialStatement": {
      return concat(["{{>", printPathParams(path, print), "}}"]);
    }
    case "CommentStatement": {
      return concat(["<!--", n.value, "-->"]);
    }
    case "StringLiteral": {
      return `"${n.value}"`;
    }
    case "NumberLiteral": {
      return String(n.value);
    }
    case "UndefinedLiteral": {
      return "undefined";
    }
    case "NullLiteral": {
      return "null";
    }
    case "Hash": {
      return concat([
        n.pairs.length ? " " : "",
        join(" ", path.map(print, "pairs"))
      ]);
    }
    case "HashPair": {
      return concat([n.key, "=", path.call(print, "value")]);
    }

    default:
      throw new Error("unknown glimmer type: " + JSON.stringify(n.type));
  }
}

function isLiteral(node) {
  return node.type.endsWith("Literal");
}

function printPathParams(path, print) {
  const node = path.getValue();
  const parts = [];

  switch (node.type) {
    case "MustacheStatement":
    case "SubExpression":
    case "ElementModifierStatement":
    case "BlockStatement":
      if (isLiteral(node.path)) {
        return String(node.path.value);
      }
      parts.push(path.call(print, "path"));
      break;
    case "PartialStatement":
      parts.push(path.call(print, "name"));
      break;
    default:
      return "";
  }

  parts.push(
    node.params.length ? " " : "",
    concat(path.map(print, "params")),
    path.call(print, "hash")
  );
  return concat(parts);
}

function printBlockParams(path) {
  const block = path.getValue();
  if (!block.program || !block.program.blockParams.length) {
    return "";
  }
  return concat([" as |", block.program.blockParams.join(" "), "|"]);
}

function printOpenBlock(path, print) {
  return concat([
    "{{#",
    printPathParams(path, print),
    printBlockParams(path, print),
    "}}"
  ]);
}

function printCloseBlock(path, print) {
  return concat(["{{/", path.call(print, "path"), "}}"]);
}

module.exports = genericPrint;
