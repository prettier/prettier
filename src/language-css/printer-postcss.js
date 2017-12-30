"use strict";

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

const removeLines = doc.utils.removeLines;

function genericPrint(path, options, print) {
  const n = path.getValue();

  /* istanbul ignore if */
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

      const maybeIndentStyle = options.cssHierarchyIndent
        ? getHierarchyIndent(path, options, print)
        : doNotHierarchyIndent;

      const text = options.originalText.slice(util.locStart(n), util.locEnd(n));
      const rawText = n.raws.text || n.text;
      let concatComment;
      // Workaround a bug where the location is off.
      // https://github.com/postcss/postcss-scss/issues/63
      if (text.indexOf(rawText) === -1) {
        if (n.raws.inline) {
          concatComment = ["// ", rawText];
        } else {
          concatComment = ["/* ", rawText, " */"];
        }
      } else {
        concatComment = [text];
      }
      return maybeIndentStyle(
        concat([path.indentStyleAsWhitespace || "", ...concatComment])
      );
    }
    case "css-rule": {
      const maybeIndentStyle = options.cssHierarchyIndent
        ? getHierarchyIndent(path, options, print)
        : doNotHierarchyIndent;
      return maybeIndentStyle(
        concat([
          path.indentStyleAsWhitespace || "",
          path.call(print, "selector"),
          n.important ? " !important" : "",
          n.nodes
            ? concat([
                " {",
                n.nodes.length > 0
                  ? indent(
                      concat([
                        hardline,
                        printNodeSequence(path, options, print)
                      ])
                    )
                  : "",
                hardline,
                "}"
              ])
            : ";"
        ])
      );
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
        maybeToLowerCase(n.prop),
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
      const isDetachedRulesetCall =
        hasParams &&
        n.params.type === "media-query-list" &&
        /^\(\s*\)$/.test(n.params.value);
      return concat([
        "@",
        // If a Less file ends up being parsed with the SCSS parser, Less
        // variable declarations will be parsed as atrules with names ending
        // with a colon, so keep the original case then.
        isDetachedRulesetCall || n.name.endsWith(":")
          ? n.name
          : maybeToLowerCase(n.name),
        hasParams
          ? concat([
              isDetachedRulesetCall ? "" : " ",
              path.call(print, "params")
            ])
          : "",
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
        maybeToLowerCase(n.name),
        " ",
        n.directives ? concat([n.directives, " "]) : "",
        adjustStrings(n.importPath, options),
        n.nodes.length > 0
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
      return group(indent(join(concat([",", line]), parts)));
    }
    case "media-query": {
      return join(" ", path.map(print, "nodes"));
    }
    case "media-type": {
      const parent = path.getParentNode(2);
      if (
        parent.type === "css-atrule" &&
        parent.name.toLowerCase() === "charset"
      ) {
        return n.value;
      }
      return adjustNumbers(adjustStrings(n.value, options));
    }
    case "media-feature-expression": {
      if (!n.nodes) {
        return n.value;
      }
      return concat(["(", concat(path.map(print, "nodes")), ")"]);
    }
    case "media-feature": {
      return maybeToLowerCase(
        adjustStrings(n.value.replace(/ +/g, " "), options)
      );
    }
    case "media-colon": {
      return concat([n.value, " "]);
    }
    case "media-value": {
      return adjustNumbers(adjustStrings(n.value, options));
    }
    case "media-keyword": {
      return adjustStrings(n.value, options);
    }
    case "media-url": {
      return adjustStrings(n.value, options);
    }
    case "media-unknown": {
      return adjustStrings(n.value, options);
    }
    // postcss-selector-parser
    case "selector-root-invalid": {
      // This is likely a SCSS nested property: `background: { color: red; }`.
      return adjustNumbers(adjustStrings(maybeToLowerCase(n.value), options));
    }
    case "selector-root": {
      return group(join(concat([",", hardline]), path.map(print, "nodes")));
    }
    case "selector-comment": {
      return n.value;
    }
    case "selector-string": {
      return adjustStrings(n.value, options);
    }
    case "selector-tag": {
      return adjustNumbers(n.value);
    }
    case "selector-id": {
      return concat(["#", n.value]);
    }
    case "selector-class": {
      return concat([".", adjustNumbers(adjustStrings(n.value, options))]);
    }
    case "selector-attribute": {
      return concat([
        "[",
        n.attribute,
        n.operator ? n.operator : "",
        n.value
          ? quoteAttributeValue(adjustStrings(n.value, options), options)
          : "",
        n.insensitive ? " i" : "",
        "]"
      ]);
    }
    case "selector-combinator": {
      if (n.value === "+" || n.value === ">" || n.value === "~") {
        const parent = path.getParentNode();
        const leading =
          parent.type === "selector-selector" && parent.nodes[0] === n
            ? ""
            : line;
        return concat([leading, n.value, " "]);
      }
      const leading = n.value.trim().startsWith("(") ? line : "";
      const value =
        adjustNumbers(adjustStrings(n.value.trim(), options)) || line;
      return concat([leading, value]);
    }
    case "selector-universal": {
      return n.value;
    }
    case "selector-selector": {
      return group(indent(concat(path.map(print, "nodes"))));
    }
    case "selector-pseudo": {
      return concat([
        maybeToLowerCase(n.value),
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
      const parent = path.getParentNode();
      let declParent;
      let i = 0;
      do {
        declParent = path.getParentNode(i++);
      } while (declParent && declParent.type !== "css-decl");

      const declParentProp = declParent.prop.toLowerCase();
      const isGridValue =
        parent.type === "value-value" &&
        (declParentProp === "grid" ||
          declParentProp.startsWith("grid-template"));

      const printed = path.map(print, "groups");
      const parts = [];
      let didBreak = false;
      for (let i = 0; i < n.groups.length; ++i) {
        parts.push(printed[i]);
        if (
          i !== n.groups.length - 1 &&
          n.groups[i + 1].raws &&
          n.groups[i + 1].raws.before !== ""
        ) {
          if (isGridValue) {
            if (
              n.groups[i].source.start.line !==
              n.groups[i + 1].source.start.line
            ) {
              parts.push(hardline);
              didBreak = true;
            } else {
              parts.push(" ");
            }
          } else if (
            n.groups[i + 1].type === "value-operator" &&
            ["+", "-", "/", "*", "%"].indexOf(n.groups[i + 1].value) !== -1
          ) {
            parts.push(" ");
          } else {
            parts.push(line);
          }
        }
      }

      if (didBreak) {
        parts.unshift(hardline);
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

      const declaration = path.getParentNode(2);
      const isMap =
        declaration &&
        declaration.type === "css-decl" &&
        declaration.prop.startsWith("$");

      return group(
        concat([
          n.open ? path.call(print, "open") : "",
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
      return concat([printNumber(n.value), maybeToLowerCase(n.unit)]);
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
      return util.printString(n.raws.quote + n.value + n.raws.quote, options);
    }
    case "value-atword": {
      return concat(["@", n.value]);
    }

    default:
      /* istanbul ignore next */
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

function printValue(value) {
  return value;
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
    value.startsWith("--")
    ? value
    : value.toLowerCase();
}

function getHierarchyIndent(path, options, print) {
  const n = path.getValue();
  const parent = path.getParentNode();
  const index = parent.nodes.indexOf(n);
  const previous =
    index > 0
      ? findNodeByType(parent.nodes, "css-rule", index - 1, "previous")
      : null;

  switch (n.type) {
    case "css-rule": {
      const isNested = !!parent.selector;
      if (isNested) {
        // Don't indent any nested style
        path.indentStyleAsWhitespace = "";
        return doNotHierarchyIndent;
      }
      path.hierarchyIndentTree = getHierarchyIndentTree(
        path,
        options,
        print,
        n,
        previous
      );
      path.indentStyleAsWhitespace = "  ".repeat(
        path.hierarchyIndentTree.length
      );
      break;
    }
    case "css-comment": {
      // When comments are between indented styles, indent the first line of the comment
      // to align with the following selector
      const next = findNodeByType(parent.nodes, "css-rule", index, "next");
      if (next) {
        const nextHierarchyIndentTree = getHierarchyIndentTree(
          path,
          options,
          print,
          next,
          previous
        );
        path.indentStyleAsWhitespace = "  ".repeat(
          nextHierarchyIndentTree.length
        );
      } else {
        // Reset indentation
        path.indentStyleAsWhitespace = "";
      }
      break;
    }
  }

  return path.hierarchyIndentTree.length
    ? doHierarchyIndent(path.hierarchyIndentTree.length)
    : doNotHierarchyIndent;
}

function getHierarchyIndentSelectorPattern(path, options, print, selector) {
  // Stringifies selectors for comparing pattern

  const SEPARATOR = "\0"; // NUL invalid in CSS so it's a safe separator
  const parent = path.getParentNode();

  // rebind because path might change
  path.pushCall = pushCall.bind(path);

  const flatten = (part, nodeType) => {
    switch (part.type || nodeType) {
      case "concat":
        return part.parts.map(flatten).join("");
      case "selector-tag":
        // Element "section" preceded by element "s" shouldn't be indented,
        // so add a character to make Element comparisons atomic.
        return `${part}${SEPARATOR}`;
      case "selector-combinator":
      case "line":
        return "";
      default:
        return part.formatted ? part.formatted : part;
    }
  };

  return selector.nodes
    .map(node =>
      path.pushCall(
        childPath =>
          flatten(
            genericPrint(childPath, options, print),
            path.getValue().type
          ),
        0,
        parent,
        1,
        node
      )
    )
    .join("");
}

function getHierarchyIndentTree(path, options, print, n, previous) {
  const tree = path.hierarchyIndentTree || [];
  const treeNodes = tree.slice();
  if (previous && tree.indexOf(previous) === -1) {
    treeNodes.push(previous);
  }
  let i = treeNodes.length - 1;
  const selectorStrings = n.selector.nodes.map(
    getHierarchyIndentSelectorPattern.bind(null, path, options, print)
  );
  while (i >= 0) {
    const leaf = treeNodes[i];
    if (
      leaf &&
      leaf.type === "css-rule" &&
      leaf.selector.nodes.some(leafSelector => {
        const leafSelectorString = getHierarchyIndentSelectorPattern(
          path,
          options,
          print,
          leafSelector
        );
        return selectorStrings.some(
          selectorString =>
            // To be indented following selectors must be longer...
            selectorString.length > leafSelectorString.length &&
            // ...and match a substring of leafSelectorString
            leafSelectorString ===
              selectorString.substr(0, leafSelectorString.length)
        );
      })
    ) {
      // Found a parent
      const newTree = tree.slice(0, i);
      newTree.push(leaf);
      return newTree;
    }
    // This Leaf wasn't a parent.
    // Try again at a deeper point in the tree
    i--;
  }
  // Found nothing. Reset tree
  return [];
}

function findNodeByType(nodes, type, startAt, direction) {
  let i = startAt;
  while (nodes[i]) {
    if (nodes[i] && nodes[i].type === type) {
      return nodes[i];
    } else if (nodes[i] && nodes[i].type !== "css-comment") {
      // Only search past comments, not other node types
      return;
    }
    i = i + (direction === "previous" ? -1 : +1);
  }
}

// Similar to FastPath.prototype.call, except that values are pushed onto
// the stack rather than keyed values
// This function is here rather than in fast-path.js (as a prototype) so
// as not to disrupt normal codepaths.
function pushCall(callback /*, value1, value2, ... */) {
  const s = this.stack;
  const origLen = s.length;
  const argc = arguments.length;
  for (let i = 1; i < argc; ++i) {
    const value = arguments[i];
    s.push(value);
  }
  const result = callback(this);
  s.length = origLen;
  return result;
}

// Pass through for when CSS is not indented
const doNotHierarchyIndent = arg => arg;

const doHierarchyIndent = times => {
  // Returns a function that indents a certain number of times
  const repeat = (arg, times) =>
    times ? repeat(concat([indent(arg)]), times - 1) : arg;
  return arg => repeat(arg, times);
};

module.exports = {
  print: genericPrint,
  hasPrettierIgnore: util.hasIgnoreComment
};
