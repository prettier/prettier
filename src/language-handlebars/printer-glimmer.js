"use strict";

const {
  concat,
  join,
  softline,
  hardline,
  line,
  group,
  indent,
  ifBreak
} = require("../doc").builders;

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
      return group(
        join(softline, path.map(print, "body").filter(text => text !== ""))
      );
    }
    case "ElementNode": {
      const tagFirstChar = n.tag[0];
      const isLocal = n.tag.indexOf(".") !== -1;
      const isGlimmerComponent =
        tagFirstChar.toUpperCase() === tagFirstChar || isLocal;
      const hasChildren = n.children.length > 0;
      const isVoid =
        (isGlimmerComponent && !hasChildren) || voidTags.indexOf(n.tag) !== -1;
      const closeTag = isVoid ? concat([" />", softline]) : ">";
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
            n.blockParams.length ? ` as |${n.blockParams.join(" ")}|` : "",
            ifBreak(softline, ""),
            closeTag
          ])
        ),
        group(
          concat([
            indent(join(softline, [""].concat(path.map(print, "children")))),
            ifBreak(hasChildren ? hardline : "", ""),
            !isVoid ? concat(["</", n.tag, ">"]) : ""
          ])
        )
      ]);
    }
    case "BlockStatement": {
      const pp = path.getParentNode(1);
      const isElseIf =
        pp &&
        pp.inverse &&
        pp.inverse.body[0] === n &&
        pp.inverse.body[0].path.parts[0] === "if";
      const hasElseIf =
        n.inverse &&
        n.inverse.body[0] &&
        n.inverse.body[0].type === "BlockStatement" &&
        n.inverse.body[0].path.parts[0] === "if";
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
      } else if (isElseIf) {
        return concat([
          concat(["{{else ", printPathParams(path, print), "}}"]),
          indent(concat([hardline, path.call(print, "program")]))
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
            indent(concat([softline, path.call(print, "program")])),
            hasParams && hasChildren ? hardline : softline,
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
          n.escaped === false ? "{{{" : "{{",
          printPathParams(path, print),
          isConcat ? "" : softline,
          n.escaped === false ? "}}}" : "}}"
        ])
      );
    }
    case "SubExpression": {
      const params = getParams(path, print);
      const printedParams =
        params.length > 0
          ? indent(concat([line, group(join(line, params))]))
          : "";
      return group(
        concat(["(", printPath(path, print), printedParams, softline, ")"])
      );
    }
    case "AttrNode": {
      const isText = n.value.type === "TextNode";
      if (isText && n.value.loc.start.column === n.value.loc.end.column) {
        return concat([n.name]);
      }
      const quote = isText ? '"' : "";
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
      let leadingSpace = "";
      let trailingSpace = "";

      // preserve a space inside of an attribute node where whitespace present, when next to mustache statement.
      const inAttrNode = path.stack.indexOf("attributes") >= 0;

      if (inAttrNode) {
        const parentNode = path.getParentNode(0);
        const isConcat = parentNode.type === "ConcatStatement";
        if (isConcat) {
          const parts = parentNode.parts;
          const partIndex = parts.indexOf(n);
          if (partIndex > 0) {
            const partType = parts[partIndex - 1].type;
            const isMustache = partType === "MustacheStatement";
            if (isMustache) {
              leadingSpace = " ";
            }
          }
          if (partIndex < parts.length - 1) {
            const partType = parts[partIndex + 1].type;
            const isMustache = partType === "MustacheStatement";
            if (isMustache) {
              trailingSpace = " ";
            }
          }
        }
      }
      return n.chars
        .replace(/^\s+/, leadingSpace)
        .replace(/\s+$/, trailingSpace);
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
      printBlockParams(path),
      softline,
      "}}"
    ])
  );
}

function printCloseBlock(path, print) {
  return concat(["{{/", path.call(print, "path"), "}}"]);
}

function clean(ast, newObj) {
  delete newObj.loc;

  // (Glimmer/HTML) ignore TextNode whitespace
  if (ast.type === "TextNode") {
    if (ast.chars.replace(/\s+/, "") === "") {
      return null;
    }
    newObj.chars = ast.chars.replace(/^\s+/, "").replace(/\s+$/, "");
  }
}

module.exports = {
  print,
  massageAstNode: clean
};
