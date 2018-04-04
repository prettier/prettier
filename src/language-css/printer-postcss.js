"use strict";

const htmlTagNames = require("html-tag-names");
const clean = require("./clean");
const privateUtil = require("../common/util");
const sharedUtil = require("../common/util-shared");
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
        options.locStart(node),
        options.locEnd(node)
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
              isDetachedRulesetDeclaration(node) ? ";" : ""
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
      const ruleAncestorNode = getAncestorNode(path, "css-rule");
      const isiCSS =
        ruleAncestorNode &&
        ruleAncestorNode.raws.selector &&
        (ruleAncestorNode.raws.selector.startsWith(":import") ||
          ruleAncestorNode.raws.selector.startsWith(":export"));

      return concat([
        node.raws.before.replace(/[\s;]/g, ""),
        isiCSS ? node.prop : maybeToLowerCase(node.prop),
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
      const isDetachedRulesetCall = hasParams && /^\(\s*\)$/.test(node.params);
      const hasParensAround =
        node.value &&
        node.value.group.group.type === "value-paren_group" &&
        node.value.group.group.open !== null &&
        node.value.group.group.close !== null;

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
                isControlDirectiveNode(node)
                  ? hasParensAround ? " " : line
                  : ""
              ])
            )
          : node.name === "else" ? " " : "",
        node.nodes
          ? concat([
              isControlDirectiveNode(node) ? "" : " ",
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
      return concat([
        join(" ", path.map(print, "nodes")),
        isLastNode(path, node) ? "" : ","
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
      const insideAtRuleNode =
        atRuleAncestorNode &&
        ["extend", "custom-selector", "nest"].indexOf(
          atRuleAncestorNode.name
        ) !== -1;

      return group(
        concat([
          atRuleAncestorNode && atRuleAncestorNode.name === "custom-selector"
            ? concat([atRuleAncestorNode.customSelector, line])
            : "",
          join(
            concat([",", insideAtRuleNode ? line : hardline]),
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
      const parentNode = path.getParentNode();
      const index = parentNode && parentNode.nodes.indexOf(node);
      const prevNode = index && parentNode.nodes[index - 1];

      return concat([
        node.namespace
          ? concat([node.namespace === true ? "" : node.namespace.trim(), "|"])
          : "",
        prevNode.type === "selector-nesting"
          ? node.value
          : adjustNumbers(
              isHTMLTag(node.value) ||
              isKeyframeAtRuleKeywords(path, node.value)
                ? node.value.toLowerCase()
                : node.value
            )
      ]);
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
        return concat([leading, node.value, isLastNode(path, node) ? "" : " "]);
      }
      const leading = node.value.trim().startsWith("(") ? line : "";
      const value =
        adjustNumbers(adjustStrings(node.value.trim(), options)) || line;
      return concat([leading, value]);
    }
    case "selector-universal": {
      return concat([
        node.namespace
          ? concat([node.namespace === true ? "" : node.namespace.trim(), "|"])
          : "",
        adjustNumbers(node.value)
      ]);
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
      return concat([
        node.inline ? "//" : "/*",
        node.value,
        node.inline ? "" : "*/"
      ]);
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
        atRuleAncestorNode && isControlDirectiveNode(atRuleAncestorNode);

      const printed = path.map(print, "groups");
      const parts = [];
      const functionAncestorNode = getAncestorNode(path, "value-func");
      const insideInFunction =
        functionAncestorNode && functionAncestorNode.value;
      const insideURLFunction =
        insideInFunction && functionAncestorNode.value.toLowerCase() === "url";

      let didBreak = false;
      for (let i = 0; i < node.groups.length; ++i) {
        parts.push(printed[i]);

        // Ignore value inside `url()`
        if (insideURLFunction) {
          continue;
        }

        const iPrevNode = node.groups[i - 1];
        const iNode = node.groups[i];
        const iNextNode = node.groups[i + 1];
        const iNextNextNode = node.groups[i + 2];

        // Ignore after latest node (i.e. before semicolon)
        if (!iNextNode) {
          continue;
        }

        // Ignore colon
        if (iNode.value === ":") {
          continue;
        }

        // Ignore `@` in Less (i.e. `@@var;`)
        if (iNode.type === "value-atword" && iNode.value === "") {
          continue;
        }

        // Ignore `~` in Less (i.e. `content: ~"^//* some horrible but needed css hack";`)
        if (iNode.value === "~") {
          continue;
        }

        if (
          (iPrevNode &&
            iPrevNode.type === "value-comment" &&
            iPrevNode.inline) ||
          (iNextNode.type === "value-comment" && iNextNode.inline)
        ) {
          continue;
        }

        const isHash = iNode.type === "value-word" && iNode.value === "#";
        const isLeftCurlyBrace =
          iNode.type === "value-word" && iNode.value === "{";
        const isNextLeftCurlyBrace =
          iNextNode.type === "value-word" && iNextNode.value === "{";
        const isRightCurlyBrace =
          iNode.type === "value-word" && iNode.value === "}";
        const isNextRightCurlyBrace =
          iNextNode.type === "value-word" && iNextNode.value === "}";

        // Ignore interpolation in SCSS (i.e. ``#{variable}``)
        if (
          isHash ||
          isLeftCurlyBrace ||
          isNextRightCurlyBrace ||
          (isNextLeftCurlyBrace &&
            iNextNode.raws &&
            iNextNode.raws.before === "") ||
          (isRightCurlyBrace && iNextNode.raws && iNextNode.raws.before === "")
        ) {
          continue;
        }

        const isNextHash =
          iNextNode.type === "value-word" && iNextNode.value === "#";

        const isMathOperator = isMathOperatorNode(iNode);
        const isNextMathOperator = isMathOperatorNode(iNextNode);

        const isMultiplication =
          !isNextHash && isMathOperator && iNode.value === "*";
        const isNextMultiplication =
          !isRightCurlyBrace && isNextMathOperator && iNextNode.value === "*";

        const isDivision = !isNextHash && isMathOperator && iNode.value === "/";
        const isNextDivision =
          !isRightCurlyBrace && isNextMathOperator && iNextNode.value === "/";

        const isAddition = !isNextHash && isMathOperator && iNode.value === "+";
        const isNextAddition =
          !isRightCurlyBrace && isNextMathOperator && iNextNode.value === "+";

        const isPrevFunction = iPrevNode && iPrevNode.type === "value-func";
        const isFunction = iNode.type === "value-func";
        const isNextFunction = iNextNode.type === "value-func";
        const isNextNextFunction =
          iNextNextNode && iNextNextNode.type === "value-func";

        const isPrevWord =
          iPrevNode &&
          ["value-word", "value-atword"].indexOf(iPrevNode.type) !== -1;
        const isWord =
          ["value-word", "value-atword"].indexOf(iNode.type) !== -1;
        const isNextWord =
          ["value-word", "value-atword"].indexOf(iNextNode.type) !== -1;
        const isNextNextWord =
          iNextNextNode &&
          ["value-word", "value-atword"].indexOf(iNextNextNode.type) !== -1;

        // Math operators
        const insideCalcFunction =
          insideInFunction &&
          functionAncestorNode.value.toLowerCase() === "calc";

        const hasSpaceBeforeOperator =
          isNextNextFunction || isNextNextWord || isFunction || isWord;

        const hasSpaceAfterOperator =
          isNextFunction || isNextWord || isPrevFunction || isPrevWord;

        if (
          (isMathOperator || isNextMathOperator) &&
          // Multiplication
          !isMultiplication &&
          !isNextMultiplication &&
          // Division
          !(isNextDivision && (hasSpaceBeforeOperator || insideCalcFunction)) &&
          !(isDivision && (hasSpaceAfterOperator || insideCalcFunction)) &&
          // Addition
          !(isNextAddition && hasSpaceBeforeOperator) &&
          !(isAddition && hasSpaceAfterOperator)
        ) {
          const isNextParenGroup = isParenGroupNode(iNextNode);
          const isNextValueNumber = iNextNode.type === "value-number";

          if (
            (iNextNode.raws && iNextNode.raws.before === "") ||
            (isMathOperator &&
              (isNextParenGroup ||
                isNextWord ||
                isNextValueNumber ||
                isMathOperatorNode(iNextNode)) &&
              (!iPrevNode || (iPrevNode && isMathOperatorNode(iPrevNode))))
          ) {
            continue;
          }
        }

        const isEqualityOperator =
          isControlDirective && isEqualityOperatorNode(iNode);
        const isRelationalOperator =
          isControlDirective && isRelationalOperatorNode(iNode);
        const isNextEqualityOperator =
          isControlDirective && isEqualityOperatorNode(iNextNode);
        const isNextRelationalOperator =
          isControlDirective && isRelationalOperatorNode(iNextNode);
        const isNextIfElseKeyword =
          isControlDirective && isIfElseKeywordNode(iNextNode);
        const isEachKeyword = isControlDirective && isEachKeywordNode(iNode);
        const isNextEachKeyword =
          isControlDirective && isEachKeywordNode(iNextNode);
        const isForKeyword =
          atRuleAncestorNode &&
          atRuleAncestorNode.name === "for" &&
          isForKeywordNode(iNode);
        const isNextForKeyword =
          isControlDirective && isForKeywordNode(iNextNode);
        const IsNextColon = iNextNode.value === ":";

        if (isGridValue) {
          if (iNode.source.start.line !== iNextNode.source.start.line) {
            parts.push(hardline);
            didBreak = true;
          } else {
            parts.push(" ");
          }
        } else if (iNode.type === "value-comment" && iNode.inline) {
          parts.push(hardline);
        } else if (
          isNextMathOperator ||
          isNextEqualityOperator ||
          isNextRelationalOperator ||
          isNextIfElseKeyword ||
          isForKeyword ||
          isEachKeyword
        ) {
          parts.push(" ");
        } else if (
          !IsNextColon ||
          isEqualityOperator ||
          isRelationalOperator ||
          isNextForKeyword ||
          isNextEachKeyword
        ) {
          parts.push(line);
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

      const declNode = path.getParentNode(2);
      const isMap =
        declNode &&
        declNode.type === "css-decl" &&
        declNode.prop.startsWith("$");

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
      return concat([node.value, insideURLFunctionNode(path) ? "" : line]);
    }
    case "value-comma": {
      return concat([node.value, " "]);
    }
    case "value-string": {
      return privateUtil.printString(
        node.raws.quote + node.value + node.raws.quote,
        options
      );
    }
    case "value-atword": {
      return concat(["@", node.value]);
    }
    case "value-unicode-range": {
      return node.value;
    }
    default:
      /* istanbul ignore next */
      throw new Error(`Unknown postcss type ${JSON.stringify(node.type)}`);
  }
}

function isLastNode(path, node) {
  const parentNode = path.getParentNode();
  if (!parentNode) {
    return false;
  }
  const nodes = parentNode.nodes;
  return nodes && nodes.indexOf(node) === nodes.length - 1;
}

function isDetachedRulesetDeclaration(node) {
  // If a Less file ends up being parsed with the SCSS parser, Less
  // variable declarations will be parsed as atrules with names ending
  // with a colon, so keep the original case then.
  return (
    node.selector &&
    node.selector.type !== "selector-root-invalid" &&
    ((typeof node.selector === "string" && /^@.+:.*$/.test(node.selector)) ||
      (node.selector.value && /^@.+:.*$/.test(node.selector.value)))
  );
}

function isKeyframeAtRuleKeywords(path, value) {
  const atRuleAncestorNode = getAncestorNode(path, "css-atrule");
  return (
    atRuleAncestorNode &&
    atRuleAncestorNode.name &&
    atRuleAncestorNode.name.toLowerCase().endsWith("keyframes") &&
    ["from", "to"].indexOf(value.toLowerCase()) !== -1
  );
}

function isHTMLTag(value) {
  return htmlTagNames.indexOf(value.toLowerCase()) !== -1;
}

function insideURLFunctionNode(path) {
  const funcAncestorNode = getAncestorNode(path, "value-func");
  return (
    funcAncestorNode &&
    funcAncestorNode.value &&
    funcAncestorNode.value === "url"
  );
}

function isParenGroupNode(node) {
  return node.type && node.type === "value-paren_group";
}

function isForKeywordNode(node) {
  return (
    node.type &&
    node.type === "value-word" &&
    node.value &&
    ["from", "through", "end"].indexOf(node.value) !== -1
  );
}

function isIfElseKeywordNode(node) {
  return (
    node.type &&
    node.type === "value-word" &&
    node.value &&
    ["and", "or", "not"].indexOf(node.value) !== -1
  );
}

function isEachKeywordNode(node) {
  return (
    node.type &&
    node.type === "value-word" &&
    node.value &&
    ["in"].indexOf(node.value) !== -1
  );
}

function isMathOperatorNode(node) {
  return (
    node.type &&
    node.type === "value-operator" &&
    node.value &&
    ["+", "-", "/", "*", "%"].indexOf(node.value) !== -1
  );
}

function isEqualityOperatorNode(node) {
  return (
    node.type &&
    node.type === "value-word" &&
    node.value &&
    ["==", "!="].indexOf(node.value) !== -1
  );
}

function isRelationalOperatorNode(node) {
  return (
    node.type &&
    node.type === "value-word" &&
    node.value &&
    ["<", ">", "<=", ">="].indexOf(node.value) !== -1
  );
}

function isControlDirectiveNode(node) {
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
          options.locStart(childNode),
          options.locEnd(childNode)
        )
      );
    } else {
      parts.push(pathChild.call(print));
    }

    if (i !== node.nodes.length - 1) {
      if (
        (node.nodes[i + 1].type === "css-comment" &&
          !privateUtil.hasNewline(
            options.originalText,
            options.locStart(node.nodes[i + 1]),
            { backwards: true }
          )) ||
        (node.nodes[i + 1].type === "css-atrule" &&
          node.nodes[i + 1].name === "else" &&
          node.nodes[i].type !== "css-comment")
      ) {
        parts.push(" ");
      } else {
        parts.push(hardline);
        if (
          sharedUtil.isNextLineEmpty(
            options.originalText,
            pathChild.getValue(),
            options
          )
        ) {
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
  return value.replace(STRING_REGEX, match =>
    privateUtil.printString(match, options)
  );
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
    privateUtil
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
    value.startsWith(":--") ||
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
  print: genericPrint,
  hasPrettierIgnore: privateUtil.hasIgnoreComment,
  massageAstNode: clean
};
