"use strict";

const docBuilders = require("../doc/doc-builders");
const util = require("../common/util");

const isNextLineEmpty = util.isNextLineEmpty;
const hasNewLineInRange = util.hasNewlineInRange;
const concat = docBuilders.concat;
const join = docBuilders.join;
const softline = docBuilders.softline;
const hardline = docBuilders.hardline;
const literalline = docBuilders.literalline;
const line = docBuilders.line;
const group = docBuilders.group;
const indent = docBuilders.indent;
const ifBreak = docBuilders.ifBreak;
const fill = docBuilders.fill;

// http://w3c.github.io/html/single-page.html#void-elements
const voidTags = [
  "area",
  "base",
  "br",
  "col",
  "embed",
  "hr",
  "img",
  "input",
  "link",
  "meta",
  "param",
  "source",
  "track",
  "wbr"
];

// Formatter based on @glimmerjs/syntax's built-in test formatter:
// https://github.com/glimmerjs/glimmer-vm/blob/master/packages/%40glimmer/syntax/lib/generation/print.ts

function print(path, options, print) {
  const n = path.getValue();

  /* istanbul ignore if*/
  if (!n) {
    return "";
  }

  switch (n.type) {
    case "Program": {
      return fill(
        whiteSpaceJoin(softline, path.map(print, "body").filter(a => a))
      );
    }
    case "ElementNode": {
      const isVoid = voidTags.indexOf(n.tag) !== -1;
      const closeTag = isVoid ? concat([" />", softline]) : ">";
      const hasChildren = n.children.length > 0;
      const getParams = (path, print) =>
        indent(
          concat([
            n.attributes.length ? line : "",
            join(line, path.map(print, "attributes")),

            n.modifiers.length ? line : "",
            join(line, path.map(print, "modifiers")),

            n.comments.length ? line : "",
            join(line, path.map(print, "comments"))
          ])
        );

      let children;
      if (hasChildren) {
        children = fill(
          whiteSpaceJoin(softline, path.map(print, "children").filter(a => a))
        );
      }

      // The problem here is that I want to not break at all if the children
      // would not break but I need to force an indent, so I use a hardline.
      /**
       * What happens now:
       * <div>
       *   Hello
       * </div>
       * ==>
       * <div>Hello</div>
       * This is due to me using hasChildren to decide to put the hardline in.
       * I would rather use a {DOES THE WHOLE THING NEED TO BREAK}
       */
      return concat([
        group(
          concat([
            "<",
            n.tag,
            getParams(path, print),
            // ifBreak(softline, ""),
            closeTag
          ])
        ),
        group(
          concat([
            hasChildren ? indent(children) : "",
            softline,
            !isVoid ? concat(["</", n.tag, ">"]) : ""
          ])
        )
      ]);
    }
    case "BlockStatement": {
      const pp = path.getParentNode(1);
      const isElseIf = pp && pp.inverse && pp.inverse.body[0] === n;
      const hasElseIf =
        n.inverse &&
        n.inverse.body[0] &&
        n.inverse.body[0].type === "BlockStatement";
      const indentElse = hasElseIf ? a => a : indent;
      if (n.inverse) {
        return concat([
          isElseIf
            ? concat(["{{else ", printPathParams(path, print), "}}"])
            : printOpenBlock(path, print),
          indent(concat([hardline, path.call(print, "program")])),
          n.inverse && !hasElseIf ? concat([hardline, "{{else}}"]) : "",
          n.inverse
            ? indentElse(concat([hardline, path.call(print, "inverse")]))
            : "",
          isElseIf ? "" : concat([hardline, printCloseBlock(path, print)])
        ]);
      }
      /**
       * I want this boolean to be: if params are going to cause a break,
       * not that it has params.
       */
      const hasParams = n.params.length > 0 || n.hash.pairs.length > 0;
      const hasChildren = n.program.body.length > 0;
      return concat([
        printOpenBlock(path, print),
        group(
          concat([
            indent(concat([path.call(print, "program")])),
            // hasParams && hasChildren ? softline : "",
            printCloseBlock(path, print)
          ])
        )
      ]);
    }
    case "ElementModifierStatement":
    case "MustacheStatement": {
      const pp = path.getParentNode(1);
      const isConcat = pp && pp.type === "ConcatStatement";
      return group(
        concat([
          /*n.escaped ? "{{{" : */ "{{",
          printPathParams(path, print),
          isConcat ? "" : softline,
          /*.escaped ? "}}}" :*/ "}}"
        ])
      );
    }
    case "SubExpression": {
      return group(
        concat([
          "(",
          printPath(path, print),
          indent(concat([line, group(join(line, getParams(path, print)))])),
          softline,
          ")"
        ])
      );
    }
    case "AttrNode": {
      const quote = n.value.type === "TextNode" ? '"' : "";
      return concat([n.name, "=", quote, path.call(print, "value"), quote]);
    }
    case "ConcatStatement": {
      return concat([
        '"',
        group(
          indent(
            join(
              softline,
              path
                .map(partPath => print(partPath), "parts")
                .filter(a => a !== "")
            )
          )
        ),
        '"'
      ]);
    }
    case "Hash": {
      return concat([join(line, path.map(print, "pairs"))]);
    }
    case "HashPair": {
      return concat([n.key, "=", path.call(print, "value")]);
    }
    case "TextNode": {
      if (n.chars.replace(/\s+/g, "") === "") {
        const numNewLines = (n.chars.match(/\n/g) || []).length;
        if (numNewLines > 2) {
          return concat(
            Array.from({ length: numNewLines - 2 }, () => hardline)
          );
        }
        if (numNewLines > 0) {
          return hardline;
        }
        return "";
      }
      let parts = [];
      const prevWhiteSpace = (n.chars.match(/^\s+/) || [])[0] || "";
      const numPreviousNewLines = (prevWhiteSpace.match(/\n/g) || []).length;
      if (numPreviousNewLines > 1) {
        parts = parts.concat(
          Array.from({ length: numPreviousNewLines - 1 }, () => hardline)
        );
      }
      if (numPreviousNewLines === 2) {
        parts.push(hardline);
      }

      parts.push(
        fill(
          n.chars
            .replace(/^\s+/, "")
            .replace(/\s+$/, "")
            .split(/(\s+)/)
            .map(
              chars =>
                /[^\s]+/.test(chars)
                  ? chars
                  : concat(
                      chars
                        .split("")
                        .map(char => (char === "\n" ? literalline : line))
                    )
            )
        )
      );

      const trailingWhiteSpace = (n.chars.match(/\s+$/) || [])[0] || "";
      const numTrailingNewLines = (trailingWhiteSpace.match(/\n/g) || [])
        .length;
      if (numTrailingNewLines > 1) {
        parts = parts.concat(
          Array.from({ length: numTrailingNewLines - 1 }, () => hardline)
        );
      }
      if (numTrailingNewLines === 2) {
        parts.push(hardline);
      }
      return concat(parts);
    }
    case "MustacheCommentStatement": {
      const dashes = n.value.indexOf("}}") > -1 ? "--" : "";
      return concat(["{{!", dashes, n.value, dashes, "}}"]);
    }
    case "PathExpression": {
      return n.original;
    }
    case "BooleanLiteral": {
      return String(n.value);
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

    /* istanbul ignore next */
    default:
      throw new Error("unknown glimmer type: " + JSON.stringify(n.type));
  }
}

function printPath(path, print) {
  return path.call(print, "path");
}

function getParams(path, print) {
  const node = path.getValue();
  let parts = [];

  if (node.params.length > 0) {
    parts = parts.concat(path.map(print, "params"));
  }

  if (node.hash && node.hash.pairs.length > 0) {
    parts.push(path.call(print, "hash"));
  }
  return parts;
}

function printPathParams(path, print) {
  let parts = [];

  parts.push(printPath(path, print));
  parts = parts.concat(getParams(path, print));

  return indent(group(join(line, parts)));
}

function printBlockParams(path) {
  const block = path.getValue();
  if (!block.program || !block.program.blockParams.length) {
    return "";
  }
  return concat([" as |", block.program.blockParams.join(" "), "|"]);
}

function printOpenBlock(path, print) {
  return group(
    concat([
      "{{#",
      printPathParams(path, print),
      printBlockParams(path, print),
      "}}"
    ])
  );
}

function printCloseBlock(path, print) {
  return concat(["{{/", path.call(print, "path"), "}}"]);
}

function clean(ast, newObj) {
  if (ast.type === "TextNode") {
    if (ast.chars.replace(/\s+/, "") === "") {
      return null;
    }
    newObj.chars = ast.chars.replace(/^ +/, "").replace(/ +$/, "");
  }
}

function isLastStatement(path) {
  const parent = path.getParentNode();
  if (!parent) {
    return true;
  }
  const node = path.getValue();
  const body = (parent.body || parent.consequent).filter(
    stmt => stmt.type !== "EmptyStatement"
  );
  return body && body[body.length - 1] === node;
}

function checkForLine(node) {
  if (!node || !node.type) {
    if (typeof node === "string") {
      return node.replace(/\s/g, "") === "";
    }
    return false;
  }
  switch (node.type) {
    case "line":
      return true;
    case "concat":
    case "fill":
      return checkForLine(node.parts[0]);
    case "group":
      return checkForLine(node.contents);
  }
  throw new Error(JSON.stringify(node));
}

function whiteSpaceJoin(delimeter, arr) {
  if (arr.every(node => checkForLine(node))) {
    return arr;
  }
  return arr
    .map((node, idx) => {
      if (!node) {
        return null;
      }
      if (idx === 0 || checkForLine(node)) {
        return node;
      }
      return concat([delimeter, node]);
    })
    .filter(a => a);
}

module.exports = {
  print,
  massageAstNode: () => {}
};
