"use strict";

const util = require("./util");
const docBuilders = require("./doc-builders");
const concat = docBuilders.concat;
const join = docBuilders.join;
const line = docBuilders.line;
const hardline = docBuilders.hardline;
const softline = docBuilders.softline;
const group = docBuilders.group;
const fill = docBuilders.fill;
const indent = docBuilders.indent;

const docUtils = require("./doc-utils");
const removeLines = docUtils.removeLines;

function genericPrint(path, options, print) {
  const n = path.getValue();

  if (!n) {
    return "";
  }

  if (typeof n === "string") {
    return n;
  }

  switch (n.type) {
    case "css-root": {
      return concat([printNodeSequence(path, options, print), hardline]);
    }
    case "css-comment": {
      if (n.raws.content) {
        return n.raws.content;
      }
      const text = options.originalText.slice(util.locStart(n), util.locEnd(n));
      const rawText = n.raws.text || n.text;
      // Workaround a bug where the location is off.
      // https://github.com/postcss/postcss-scss/issues/63
      if (text.indexOf(rawText) === -1) {
        if (n.raws.inline) {
          return concat(["// ", rawText]);
        }
        return concat(["/* ", rawText, " */"]);
      }
      return text;
    }
    case "css-rule": {
      return concat([
        path.call(print, "selector"),
        n.important ? " !important" : "",
        n.nodes
          ? concat([
              " {",
              n.nodes.length > 0
                ? indent(
                    concat([hardline, printNodeSequence(path, options, print)])
                  )
                : "",
              hardline,
              "}"
            ])
          : ";"
      ]);
    }
    case "css-decl": {
      // When the following less construct &:extend(.foo); is parsed with scss,
      // it will put a space after `:` and break it. Ideally we should parse
      // less files with less, but we can hardcode this to work with scss as
      // well.
      const isValueExtend =
        n.value.type === "value-root" &&
        n.value.group.type === "value-value" &&
        n.value.group.group.type === "value-func" &&
        n.value.group.group.value === "extend";
      const isComposed =
        n.value.type === "value-root" &&
        n.value.group.type === "value-value" &&
        n.prop === "composes";

      return concat([
        n.raws.before.replace(/[\s;]/g, ""),
        n.prop,
        ":",
        isValueExtend ? "" : " ",
        isComposed
          ? removeLines(path.call(print, "value"))
          : path.call(print, "value"),
        n.important ? " !important" : "",
        n.nodes
          ? concat([
              " {",
              indent(
                concat([softline, printNodeSequence(path, options, print)])
              ),
              softline,
              "}"
            ])
          : ";"
      ]);
    }
    case "css-atrule": {
      const hasParams =
        n.params &&
        !(n.params.type === "media-query-list" && n.params.value === "");
      return concat([
        "@",
        n.name,
        hasParams ? concat([" ", path.call(print, "params")]) : "",
        n.nodes
          ? concat([
              " {",
              indent(
                concat([
                  n.nodes.length > 0 ? softline : "",
                  printNodeSequence(path, options, print)
                ])
              ),
              softline,
              "}"
            ])
          : ";"
      ]);
    }
    case "css-import": {
      return concat([
        "@",
        n.name,
        " ",
        n.directives ? concat([n.directives, " "]) : "",
        n.importPath,
        ";"
      ]);
    }
    // postcss-media-query-parser
    case "media-query-list": {
      const parts = [];
      path.each(childPath => {
        const node = childPath.getValue();
        if (node.type === "media-query" && node.value === "") {
          return;
        }
        parts.push(childPath.call(print));
      }, "nodes");
      return group(indent(join(concat([",", line]), parts)));
    }
    case "media-query": {
      return join(" ", path.map(print, "nodes"));
    }
    case "media-type": {
      return n.value;
    }
    case "media-feature-expression": {
      if (!n.nodes) {
        return n.value;
      }
      return concat(["(", concat(path.map(print, "nodes")), ")"]);
    }
    case "media-feature": {
      return n.value.replace(/ +/g, " ");
    }
    case "media-colon": {
      return concat([n.value, " "]);
    }
    case "media-value": {
      return n.value;
    }
    case "media-keyword": {
      return n.value;
    }
    case "media-url": {
      return n.value;
    }
    case "media-unknown": {
      return n.value;
    }
    // postcss-selector-parser
    case "selector-root": {
      return group(join(concat([",", hardline]), path.map(print, "nodes")));
    }
    case "selector-comment": {
      return n.value;
    }
    case "selector-string": {
      return n.value;
    }
    case "selector-tag": {
      return n.value;
    }
    case "selector-id": {
      return concat(["#", n.value]);
    }
    case "selector-class": {
      return concat([".", n.value]);
    }
    case "selector-attribute": {
      return concat([
        "[",
        n.attribute,
        n.operator ? n.operator : "",
        n.value ? n.value : "",
        n.insensitive ? " i" : "",
        "]"
      ]);
    }
    case "selector-combinator": {
      if (n.value === "+" || n.value === ">" || n.value === "~") {
        const parent = path.getParentNode();
        const leading = parent.type === "selector-selector" &&
          parent.nodes[0] === n
          ? ""
          : line;
        return concat([leading, n.value, " "]);
      }
      return n.value;
    }
    case "selector-universal": {
      return n.value;
    }
    case "selector-selector": {
      return group(indent(concat(path.map(print, "nodes"))));
    }
    case "selector-pseudo": {
      return concat([
        n.value,
        n.nodes && n.nodes.length > 0
          ? concat(["(", join(", ", path.map(print, "nodes")), ")"])
          : ""
      ]);
    }
    case "selector-nesting": {
      return printValue(n.value);
    }
    // postcss-values-parser
    case "value-root": {
      return path.call(print, "group");
    }
    case "value-comma_group": {
      const printed = path.map(print, "groups");
      const parts = [];
      for (let i = 0; i < n.groups.length; ++i) {
        parts.push(printed[i]);
        if (
          i !== n.groups.length - 1 &&
          n.groups[i + 1].raws &&
          n.groups[i + 1].raws.before !== ""
        ) {
          if (
            n.groups[i + 1].type === "value-operator" &&
            ["+", "-", "/", "*", "%"].indexOf(n.groups[i + 1].value) !== -1
          ) {
            parts.push(" ");
          } else {
            parts.push(line);
          }
        }
      }

      return group(indent(fill(parts)));
    }
    case "value-paren_group": {
      const parent = path.getParentNode();
      const isURLCall =
        parent && parent.type === "value-func" && parent.value === "url";

      if (
        isURLCall &&
        (n.groups.length === 1 ||
          (n.groups.length > 0 &&
            n.groups[0].type === "value-comma_group" &&
            n.groups[0].groups.length > 0 &&
            n.groups[0].groups[0].type === "value-word" &&
            n.groups[0].groups[0].value === "data"))
      ) {
        return concat([
          n.open ? path.call(print, "open") : "",
          join(",", path.map(print, "groups")),
          n.close ? path.call(print, "close") : ""
        ]);
      }

      if (!n.open) {
        const printed = path.map(print, "groups");
        const res = [];

        for (let i = 0; i < printed.length; i++) {
          if (i !== 0) {
            res.push(concat([",", line]));
          }
          res.push(printed[i]);
        }
        return group(indent(fill(res)));
      }

      return group(
        concat([
          n.open ? path.call(print, "open") : "",
          indent(
            concat([
              softline,
              join(concat([",", line]), path.map(print, "groups"))
            ])
          ),
          softline,
          n.close ? path.call(print, "close") : ""
        ])
      );
    }
    case "value-value": {
      return path.call(print, "group");
    }
    case "value-func": {
      return concat([n.value, path.call(print, "group")]);
    }
    case "value-paren": {
      if (n.raws.before !== "") {
        return concat([line, n.value]);
      }
      return n.value;
    }
    case "value-number": {
      return concat([n.value, n.unit]);
    }
    case "value-operator": {
      return n.value;
    }
    case "value-word": {
      if (n.isColor && n.isHex) {
        return n.value.toLowerCase();
      }
      return n.value;
    }
    case "value-colon": {
      return n.value;
    }
    case "value-comma": {
      return concat([n.value, " "]);
    }
    case "value-string": {
      return concat([
        n.quoted ? n.raws.quote : "",
        n.value,
        n.quoted ? n.raws.quote : ""
      ]);
    }
    case "value-atword": {
      return concat(["@", n.value]);
    }

    default:
      throw new Error("unknown postcss type: " + JSON.stringify(n.type));
  }
}

function printNodeSequence(path, options, print) {
  const node = path.getValue();
  const parts = [];
  let i = 0;
  path.map(pathChild => {
    const prevNode = node.nodes[i - 1];
    if (
      prevNode &&
      prevNode.type === "css-comment" &&
      prevNode.text.trim() === "prettier-ignore"
    ) {
      const childNode = pathChild.getValue();
      parts.push(
        options.originalText.slice(
          util.locStart(childNode),
          util.locEnd(childNode)
        )
      );
    } else {
      parts.push(pathChild.call(print));
    }

    if (i !== node.nodes.length - 1) {
      if (
        (node.nodes[i + 1].type === "css-comment" &&
          !util.hasNewline(
            options.originalText,
            util.locStart(node.nodes[i + 1]),
            { backwards: true }
          )) ||
        (node.nodes[i + 1].type === "css-atrule" &&
          node.nodes[i + 1].name === "else")
      ) {
        parts.push(" ");
      } else {
        parts.push(hardline);
        if (util.isNextLineEmpty(options.originalText, pathChild.getValue())) {
          parts.push(hardline);
        }
      }
    }
    i++;
  }, "nodes");

  return concat(parts);
}

function printValue(value) {
  return value;
}

module.exports = genericPrint;
