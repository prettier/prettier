"use strict";

const clean = require("./clean");
const util = require("../common/util");
const doc = require("../doc");
const docBuilders = doc.builders;
const concat = docBuilders.concat;
const join = docBuilders.join;
const line = docBuilders.line;
const hardline = docBuilders.hardline;
const softline = docBuilders.softline;
const group = docBuilders.group;
const fill = docBuilders.fill;
const indent = docBuilders.indent;
const printerOptions = require("./options");

const removeLines = doc.utils.removeLines;

function genericPrint(path, options, print) {
  const node = path.getValue();

  /* istanbul ignore if */
  if (!node) {
    return "";
  }

  if (typeof node === "string") {
    return node;
  }

  switch (node.type) {
    case "css-comment-yaml":
      return node.value;
    case "css-root": {
      const nodes = printNodeSequence(path, options, print);

      if (nodes.parts.length) {
        return concat([nodes, hardline]);
      }

      return nodes;
    }
    case "css-comment": {
      if (node.raws.content) {
        return node.raws.content;
      }
      const text = options.originalText.slice(
        util.locStart(node),
        util.locEnd(node)
      );
      const rawText = node.raws.text || node.text;
      // Workaround a bug where the location is off.
      // https://github.com/postcss/postcss-scss/issues/63
      if (text.indexOf(rawText) === -1) {
        if (node.raws.inline) {
          return concat(["// ", rawText]);
        }
        return concat(["/* ", rawText, " */"]);
      }
      return text;
    }
    case "css-rule": {
      // If a Less file ends up being parsed with the SCSS parser, Less
      // variable declarations will be parsed as atrules with names ending
      // with a colon, so keep the original case then.
      const isDetachedRulesetDeclaration =
        node.selector &&
        typeof node.selector === "string" &&
        node.selector.startsWith("@") &&
        node.selector.endsWith(":");
      return concat([
        path.call(print, "selector"),
        node.important ? " !important" : "",
        node.nodes
          ? concat([
              " {",
              node.nodes.length > 0
                ? indent(
                    concat([hardline, printNodeSequence(path, options, print)])
                  )
                : "",
              hardline,
              "}",
              isDetachedRulesetDeclaration ? ";" : ""
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
        node.value.type === "value-root" &&
        node.value.group.type === "value-value" &&
        node.value.group.group.type === "value-func" &&
        node.value.group.group.value === "extend";
      const isComposed =
        node.value.type === "value-root" &&
        node.value.group.type === "value-value" &&
        node.prop === "composes";

      return concat([
        node.raws.before.replace(/[\s;]/g, ""),
        maybeToLowerCase(node.prop),
        node.raws.between.trim() === ":" ? ":" : node.raws.between.trim(),
        isValueExtend ? "" : " ",
        isComposed
          ? removeLines(path.call(print, "value"))
          : path.call(print, "value"),
        node.raws.important
          ? node.raws.important.replace(/\s*!\s*important/i, " !important")
          : node.important ? " !important" : "",
        node.raws.scssDefault
          ? node.raws.scssDefault.replace(/\s*!default/i, " !default")
          : node.scssDefault ? " !default" : "",
        node.raws.scssGlobal
          ? node.raws.scssGlobal.replace(/\s*!global/i, " !global")
          : node.scssGlobal ? " !global" : "",
        node.nodes
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
        node.params &&
        !(node.params.type === "media-query-list" && node.params.value === "");
      const isDetachedRulesetCall =
        hasParams &&
        node.params.type === "media-query-list" &&
        /^\(\s*\)$/.test(node.params.value);
      const isControlDirective = isNodeControlDirective(node);
      const hasParensAround =
        node.value &&
        node.value.group.group.type === "value-paren_group" &&
        node.value.group.group.open !== null &&
        node.value.group.group.close !== null;
      const isElse = node.name === "else";

      return concat([
        "@",
        // If a Less file ends up being parsed with the SCSS parser, Less
        // variable declarations will be parsed as atrules with names ending
        // with a colon, so keep the original case then.
        isDetachedRulesetCall || node.name.endsWith(":")
          ? node.name
          : maybeToLowerCase(node.name),
        hasParams
          ? concat([
              isDetachedRulesetCall ? "" : " ",
              path.call(print, "params")
            ])
          : "",
        node.selector
          ? indent(concat([" ", path.call(print, "selector")]))
          : "",
        node.value
          ? group(
              concat([
                " ",
                path.call(print, "value"),
                isControlDirective ? (hasParensAround ? " " : line) : ""
              ])
            )
          : isElse ? " " : "",
        node.nodes
          ? concat([
              isControlDirective ? "" : " ",
              "{",
              indent(
                concat([
                  node.nodes.length > 0 ? softline : "",
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
        maybeToLowerCase(node.name),
        " ",
        node.directives ? concat([node.directives, " "]) : "",
        adjustStrings(node.importPath, options),
        node.nodes.length > 0
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

      return group(indent(join(line, parts)));
    }
    case "media-query": {
      const parentNode = path.getParentNode();
      const isLastNode =
        parentNode &&
        parentNode.nodes &&
        parentNode.nodes.indexOf(node) === parentNode.nodes.length - 1;

      return concat([
        join(" ", path.map(print, "nodes")),
        isLastNode ? "" : ","
      ]);
    }
    case "media-type": {
      const atRuleAncestorNode = getAncestorNode(path, "css-atrule");
      if (
        atRuleAncestorNode &&
        atRuleAncestorNode.name.toLowerCase() === "charset"
      ) {
        return node.value;
      }
      return adjustNumbers(adjustStrings(node.value, options));
    }
    case "media-feature-expression": {
      if (!node.nodes) {
        return node.value;
      }
      return concat(["(", concat(path.map(print, "nodes")), ")"]);
    }
    case "media-feature": {
      return maybeToLowerCase(
        adjustStrings(node.value.replace(/ +/g, " "), options)
      );
    }
    case "media-colon": {
      return concat([node.value, " "]);
    }
    case "media-value": {
      return adjustNumbers(adjustStrings(node.value, options));
    }
    case "media-keyword": {
      return adjustStrings(node.value, options);
    }
    case "media-url": {
      return adjustStrings(
        node.value.replace(/^url\(\s+/gi, "url(").replace(/\s+\)$/gi, ")"),
        options
      );
    }
    case "media-unknown": {
      return adjustStrings(node.value, options);
    }
    // postcss-selector-parser
    case "selector-root-invalid": {
      // This is likely a SCSS nested property: `background: { color: red; }`.
      return adjustNumbers(
        adjustStrings(maybeToLowerCase(node.value), options)
      );
    }
    case "selector-root": {
      const atRuleAncestorNode = getAncestorNode(path, "css-atrule");
      const insideInExtend =
        atRuleAncestorNode && atRuleAncestorNode.name === "extend";
      const insideInCustomSelector =
        atRuleAncestorNode && atRuleAncestorNode.name === "custom-selector";

      return group(
        concat([
          insideInCustomSelector
            ? concat([atRuleAncestorNode.customSelector, line])
            : "",
          join(
            concat([
              ",",
              insideInExtend || insideInCustomSelector ? line : hardline
            ]),
            path.map(print, "nodes")
          )
        ])
      );
    }
    case "selector-comment": {
      return node.value;
    }
    case "selector-string": {
      return adjustStrings(node.value, options);
    }
    case "selector-tag": {
      return adjustNumbers(node.value);
    }
    case "selector-id": {
      return concat(["#", node.value]);
    }
    case "selector-class": {
      return concat([".", adjustNumbers(adjustStrings(node.value, options))]);
    }
    case "selector-attribute": {
      return concat([
        "[",
        node.namespace
          ? concat([node.namespace === true ? "" : node.namespace.trim(), "|"])
          : "",
        node.attribute.trim(),
        node.operator ? node.operator : "",
        node.value
          ? quoteAttributeValue(
              adjustStrings(node.value.trim(), options),
              options
            )
          : "",
        node.insensitive ? " i" : "",
        "]"
      ]);
    }
    case "selector-combinator": {
      if (
        node.value === "+" ||
        node.value === ">" ||
        node.value === "~" ||
        node.value === ">>>"
      ) {
        const parentNode = path.getParentNode();
        const leading =
          parentNode.type === "selector-selector" &&
          parentNode.nodes[0] === node
            ? ""
            : line;
        const isLastNode =
          parentNode.nodes.length - 1 === parentNode.nodes.indexOf(node);
        return concat([leading, node.value, isLastNode ? "" : " "]);
      }
      const leading = node.value.trim().startsWith("(") ? line : "";
      const value =
        adjustNumbers(adjustStrings(node.value.trim(), options)) || line;
      return concat([leading, value]);
    }
    case "selector-universal": {
      return node.value;
    }
    case "selector-selector": {
      return group(indent(concat(path.map(print, "nodes"))));
    }
    case "selector-pseudo": {
      return concat([
        maybeToLowerCase(node.value),
        node.nodes && node.nodes.length > 0
          ? concat(["(", join(", ", path.map(print, "nodes")), ")"])
          : ""
      ]);
    }
    case "selector-nesting": {
      return node.value;
    }
    // postcss-values-parser
    case "value-root": {
      return path.call(print, "group");
    }
    case "value-comment": {
      return concat(["/*", node.value, "*/"]);
    }
    case "value-comma_group": {
      const parentNode = path.getParentNode();
      const declAncestorNode = getAncestorNode(path, "css-decl");
      const declAncestorProp =
        declAncestorNode &&
        declAncestorNode.prop &&
        declAncestorNode.prop.toLowerCase();
      const isGridValue =
        declAncestorProp &&
        parentNode.type === "value-value" &&
        (declAncestorProp === "grid" ||
          declAncestorProp.startsWith("grid-template"));
      const atRuleAncestorNode = getAncestorNode(path, "css-atrule");
      const isControlDirective =
        atRuleAncestorNode && isNodeControlDirective(atRuleAncestorNode);

      const printed = path.map(print, "groups");
      const parts = [];
      let didBreak = false;
      for (let i = 0; i < node.groups.length; ++i) {
        parts.push(printed[i]);
        if (
          i !== node.groups.length - 1 &&
          node.groups[i + 1].raws &&
          node.groups[i + 1].raws.before !== ""
        ) {
          const isNextValueOperator =
            node.groups[i + 1].type === "value-operator";
          const isNextMathOperator =
            isNextValueOperator &&
            ["+", "-", "/", "*", "%"].indexOf(node.groups[i + 1].value) !== -1;
          const isNextValueWord = node.groups[i + 1].type === "value-word";
          const isNextEqualityOperator =
            isControlDirective &&
            isNextValueWord &&
            ["==", "!="].indexOf(node.groups[i + 1].value) !== -1;
          const isNextRelationalOperator =
            isControlDirective &&
            isNextValueWord &&
            ["<", ">", "<=", ">="].indexOf(node.groups[i + 1].value) !== -1;
          const isNextIfElseKeyword =
            isControlDirective &&
            ["and", "or", "not"].indexOf(node.groups[i + 1].value) !== -1;
          const isNextEachKeyword =
            isControlDirective &&
            ["in"].indexOf(node.groups[i + 1].value) !== -1;
          const isForKeyword =
            atRuleAncestorNode &&
            atRuleAncestorNode.name === "for" &&
            ["from", "through", "end"].indexOf(node.groups[i].value) !== -1;
          const isNextForKeyword =
            isControlDirective &&
            ["from", "through", "end"].indexOf(node.groups[i + 1].value) !== -1;
          const IsNextColon = node.groups[i + 1].value === ":";

          if (isGridValue) {
            if (
              node.groups[i].source.start.line !==
              node.groups[i + 1].source.start.line
            ) {
              parts.push(hardline);
              didBreak = true;
            } else {
              parts.push(" ");
            }
          } else if (
            isNextMathOperator ||
            isNextEqualityOperator ||
            isNextRelationalOperator ||
            isNextIfElseKeyword ||
            isForKeyword
          ) {
            parts.push(" ");
          } else if (!IsNextColon || isNextForKeyword || isNextEachKeyword) {
            parts.push(line);
          }
        }
      }

      if (didBreak) {
        parts.unshift(hardline);
      }

      if (isControlDirective) {
        return group(indent(concat(parts)));
      }

      return group(indent(fill(parts)));
    }
    case "value-paren_group": {
      const parentNode = path.getParentNode();
      const isURLCall =
        parentNode &&
        parentNode.type === "value-func" &&
        parentNode.value === "url";

      if (
        isURLCall &&
        (node.groups.length === 1 ||
          (node.groups.length > 0 &&
            node.groups[0].type === "value-comma_group" &&
            node.groups[0].groups.length > 0 &&
            node.groups[0].groups[0].type === "value-word" &&
            node.groups[0].groups[0].value.startsWith("data:")))
      ) {
        return concat([
          node.open ? path.call(print, "open") : "",
          join(",", path.map(print, "groups")),
          node.close ? path.call(print, "close") : ""
        ]);
      }

      if (!node.open) {
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

      const decl = path.getParentNode(2);
      const isMap =
        decl && decl.type === "css-decl" && decl.prop.startsWith("$");

      return group(
        concat([
          node.open ? path.call(print, "open") : "",
          indent(
            concat([
              softline,
              join(
                concat([",", isMap ? hardline : line]),
                path.map(print, "groups")
              )
            ])
          ),
          softline,
          node.close ? path.call(print, "close") : ""
        ])
      );
    }
    case "value-value": {
      return path.call(print, "group");
    }
    case "value-func": {
      return concat([node.value, path.call(print, "group")]);
    }
    case "value-paren": {
      if (node.raws.before !== "") {
        const parentParentNode = path.getParentNode(2);
        const isFunction =
          parentParentNode && parentParentNode.type === "value-func";

        return concat([isFunction ? "" : line, node.value]);
      }
      return node.value;
    }
    case "value-number": {
      return concat([printNumber(node.value), maybeToLowerCase(node.unit)]);
    }
    case "value-operator": {
      return node.value;
    }
    case "value-word": {
      if ((node.isColor && node.isHex) || isWideKeywords(node.value)) {
        return node.value.toLowerCase();
      }
      return node.value;
    }
    case "value-colon": {
      return node.value;
    }
    case "value-comma": {
      return concat([node.value, " "]);
    }
    case "value-string": {
      return util.printString(
        node.raws.quote + node.value + node.raws.quote,
        options
      );
    }
    case "value-atword": {
      return concat(["@", node.value]);
    }

    default:
      /* istanbul ignore next */
      throw new Error("unknown postcss type: " + JSON.stringify(node.type));
  }
}

function isNodeControlDirective(node) {
  return (
    node.type &&
    node.type === "css-atrule" &&
    node.name &&
    (node.name === "if" ||
      node.name === "else" ||
      node.name === "for" ||
      node.name === "each" ||
      node.name === "while")
  );
}

function getAncestorCounter(path, typeOrTypes) {
  const types = [].concat(typeOrTypes);

  let counter = -1;
  let ancestorNode;

  while ((ancestorNode = path.getParentNode(++counter))) {
    if (types.indexOf(ancestorNode.type) !== -1) {
      return counter;
    }
  }

  return -1;
}

function getAncestorNode(path, typeOrTypes) {
  const counter = getAncestorCounter(path, typeOrTypes);
  return counter === -1 ? null : path.getParentNode(counter);
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
          node.nodes[i + 1].name === "else" &&
          node.nodes[i].type !== "css-comment")
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

const STRING_REGEX = /(['"])(?:(?!\1)[^\\]|\\[\s\S])*\1/g;
const NUMBER_REGEX = /(?:\d*\.\d+|\d+\.?)(?:[eE][+-]?\d+)?/g;
const STANDARD_UNIT_REGEX = /[a-zA-Z]+/g;
const WORD_PART_REGEX = /[$@]?[a-zA-Z_\u0080-\uFFFF][\w\-\u0080-\uFFFF]*/g;
const ADJUST_NUMBERS_REGEX = RegExp(
  STRING_REGEX.source +
    `|` +
    `(${WORD_PART_REGEX.source})?` +
    `(${NUMBER_REGEX.source})` +
    `(${STANDARD_UNIT_REGEX.source})?`,
  "g"
);

function adjustStrings(value, options) {
  return value.replace(STRING_REGEX, match => util.printString(match, options));
}

function quoteAttributeValue(value, options) {
  const quote = options.singleQuote ? "'" : '"';
  return value.includes('"') || value.includes("'")
    ? value
    : quote + value + quote;
}

function adjustNumbers(value) {
  return value.replace(
    ADJUST_NUMBERS_REGEX,
    (match, quote, wordPart, number, unit) =>
      !wordPart && number
        ? (wordPart || "") + printNumber(number) + maybeToLowerCase(unit || "")
        : match
  );
}

function printNumber(rawNumber) {
  return (
    util
      .printNumber(rawNumber)
      // Remove trailing `.0`.
      .replace(/\.0(?=$|e)/, "")
  );
}

function maybeToLowerCase(value) {
  return value.includes("$") ||
    value.includes("@") ||
    value.includes("#") ||
    value.startsWith("%") ||
    value.startsWith("--") ||
    (value.includes("(") && value.includes(")"))
    ? value
    : value.toLowerCase();
}

function isWideKeywords(value) {
  return (
    ["initial", "inherit", "unset", "revert"].indexOf(
      value.replace().toLowerCase()
    ) !== -1
  );
}

module.exports = {
  options: printerOptions,
  print: genericPrint,
  hasPrettierIgnore: util.hasIgnoreComment,
  massageAstNode: clean
};
