import {
  printNumber,
  printString,
  hasNewline,
  isFrontMatterNode,
  isNextLineEmpty,
  isNonEmptyArray,
} from "../common/util.js";
import {
  join,
  line,
  hardline,
  softline,
  group,
  fill,
  indent,
  dedent,
  ifBreak,
  breakParent,
} from "../document/builders.js";
import { removeLines, getDocParts } from "../document/utils.js";
import UnexpectedNodeError from "../utils/unexpected-node-error.js";
import clean from "./clean.js";
import embed from "./embed.js";
import { insertPragma } from "./pragma.js";
import getVisitorKeys from "./get-visitor-keys.js";

import {
  getPropOfDeclNode,
  maybeToLowerCase,
  insideValueFunctionNode,
  insideICSSRuleNode,
  insideAtRuleNode,
  insideURLFunctionInImportAtRuleNode,
  isKeyframeAtRuleKeywords,
  isWideKeywords,
  isLastNode,
  isSCSSControlDirectiveNode,
  isDetachedRulesetDeclarationNode,
  isRelationalOperatorNode,
  isEqualityOperatorNode,
  isMultiplicationNode,
  isDivisionNode,
  isAdditionNode,
  isSubtractionNode,
  isMathOperatorNode,
  isEachKeywordNode,
  isForKeywordNode,
  isURLFunctionNode,
  isIfElseKeywordNode,
  hasComposesNode,
  hasParensAroundNode,
  hasEmptyRawBefore,
  isKeyValuePairNode,
  isKeyInValuePairNode,
  isDetachedRulesetCallNode,
  isTemplatePlaceholderNode,
  isTemplatePropNode,
  isPostcssSimpleVarNode,
  isSCSSMapItemNode,
  isInlineValueCommentNode,
  isHashNode,
  isLeftCurlyBraceNode,
  isRightCurlyBraceNode,
  isWordNode,
  isColonNode,
  isMediaAndSupportsKeywords,
  isColorAdjusterFuncNode,
  lastLineHasInlineComment,
  isAtWordPlaceholderNode,
  isConfigurationNode,
  isParenGroupNode,
  isVarFunctionNode,
} from "./utils/index.js";
import { locStart, locEnd } from "./loc.js";
import printUnit from "./utils/print-unit.js";

function shouldPrintComma(options) {
  return options.trailingComma === "es5" || options.trailingComma === "all";
}

function genericPrint(path, options, print) {
  const { node } = path;

  switch (node.type) {
    case "front-matter":
      return [node.raw, hardline];
    case "css-root": {
      const nodes = printNodeSequence(path, options, print);
      let after = node.raws.after.trim();
      if (after.startsWith(";")) {
        after = after.slice(1).trim();
      }

      return [
        node.frontMatter ? [print("frontMatter"), hardline] : "",
        nodes,
        after ? ` ${after}` : "",
        node.nodes.length > 0 ? hardline : "",
      ];
    }
    case "css-comment": {
      const isInlineComment = node.inline || node.raws.inline;

      const text = options.originalText.slice(locStart(node), locEnd(node));

      return isInlineComment ? text.trimEnd() : text;
    }
    case "css-rule":
      return [
        print("selector"),
        node.important ? " !important" : "",
        node.nodes
          ? [
              node.selector?.type === "selector-unknown" &&
              lastLineHasInlineComment(node.selector.value)
                ? line
                : node.selector
                ? " "
                : "",
              "{",
              node.nodes.length > 0
                ? indent([hardline, printNodeSequence(path, options, print)])
                : "",
              hardline,
              "}",
              isDetachedRulesetDeclarationNode(node) ? ";" : "",
            ]
          : ";",
      ];

    case "css-decl": {
      const parentNode = path.parent;

      const { between: rawBetween } = node.raws;
      const trimmedBetween = rawBetween.trim();
      const isColon = trimmedBetween === ":";
      const isValueAllSpace =
        typeof node.value === "string" && /^ *$/.test(node.value);
      let value = typeof node.value === "string" ? node.value : print("value");

      value = hasComposesNode(node) ? removeLines(value) : value;

      if (!isColon && lastLineHasInlineComment(trimmedBetween)) {
        value = indent([hardline, dedent(value)]);
      }

      return [
        node.raws.before.replaceAll(/[\s;]/g, ""),
        // Less variable
        (parentNode.type === "css-atrule" && parentNode.variable) ||
        insideICSSRuleNode(path)
          ? node.prop
          : maybeToLowerCase(node.prop),
        trimmedBetween.startsWith("//") ? " " : "",
        trimmedBetween,
        node.extend || isValueAllSpace ? "" : " ",
        options.parser === "less" && node.extend && node.selector
          ? ["extend(", print("selector"), ")"]
          : "",
        value,
        node.raws.important
          ? node.raws.important.replace(/\s*!\s*important/i, " !important")
          : node.important
          ? " !important"
          : "",
        node.raws.scssDefault
          ? node.raws.scssDefault.replace(/\s*!default/i, " !default")
          : node.scssDefault
          ? " !default"
          : "",
        node.raws.scssGlobal
          ? node.raws.scssGlobal.replace(/\s*!global/i, " !global")
          : node.scssGlobal
          ? " !global"
          : "",
        node.nodes
          ? [
              " {",
              indent([softline, printNodeSequence(path, options, print)]),
              softline,
              "}",
            ]
          : isTemplatePropNode(node) &&
            !parentNode.raws.semicolon &&
            options.originalText[locEnd(node) - 1] !== ";"
          ? ""
          : options.__isHTMLStyleAttribute && isLastNode(path, node)
          ? ifBreak(";")
          : ";",
      ];
    }
    case "css-atrule": {
      const parentNode = path.parent;
      const isTemplatePlaceholderNodeWithoutSemiColon =
        isTemplatePlaceholderNode(node) &&
        !parentNode.raws.semicolon &&
        options.originalText[locEnd(node) - 1] !== ";";

      if (options.parser === "less") {
        if (node.mixin) {
          return [
            print("selector"),
            node.important ? " !important" : "",
            isTemplatePlaceholderNodeWithoutSemiColon ? "" : ";",
          ];
        }

        if (node.function) {
          return [
            node.name,
            typeof node.params === "string" ? node.params : print("params"),
            isTemplatePlaceholderNodeWithoutSemiColon ? "" : ";",
          ];
        }

        if (node.variable) {
          return [
            "@",
            node.name,
            ": ",
            node.value ? print("value") : "",
            node.raws.between.trim() ? node.raws.between.trim() + " " : "",
            node.nodes
              ? [
                  "{",
                  indent([
                    node.nodes.length > 0 ? softline : "",
                    printNodeSequence(path, options, print),
                  ]),
                  softline,
                  "}",
                ]
              : "",
            isTemplatePlaceholderNodeWithoutSemiColon ? "" : ";",
          ];
        }
      }
      const isImportUnknownValueEndsWithSemiColon =
        node.name === "import" &&
        node.params?.type === "value-unknown" &&
        node.params.value.endsWith(";");

      return [
        "@",
        // If a Less file ends up being parsed with the SCSS parser, Less
        // variable declarations will be parsed as at-rules with names ending
        // with a colon, so keep the original case then.
        isDetachedRulesetCallNode(node) || node.name.endsWith(":")
          ? node.name
          : maybeToLowerCase(node.name),
        node.params
          ? [
              isDetachedRulesetCallNode(node)
                ? ""
                : isTemplatePlaceholderNode(node)
                ? node.raws.afterName === ""
                  ? ""
                  : node.name.endsWith(":")
                  ? " "
                  : /^\s*\n\s*\n/.test(node.raws.afterName)
                  ? [hardline, hardline]
                  : /^\s*\n/.test(node.raws.afterName)
                  ? hardline
                  : " "
                : " ",
              typeof node.params === "string" ? node.params : print("params"),
            ]
          : "",
        node.selector ? indent([" ", print("selector")]) : "",
        node.value
          ? group([
              " ",
              print("value"),
              isSCSSControlDirectiveNode(node, options)
                ? hasParensAroundNode(node)
                  ? " "
                  : line
                : "",
            ])
          : node.name === "else"
          ? " "
          : "",
        node.nodes
          ? [
              isSCSSControlDirectiveNode(node, options)
                ? ""
                : (node.selector &&
                    !node.selector.nodes &&
                    typeof node.selector.value === "string" &&
                    lastLineHasInlineComment(node.selector.value)) ||
                  (!node.selector &&
                    typeof node.params === "string" &&
                    lastLineHasInlineComment(node.params))
                ? line
                : " ",
              "{",
              indent([
                node.nodes.length > 0 ? softline : "",
                printNodeSequence(path, options, print),
              ]),
              softline,
              "}",
            ]
          : isTemplatePlaceholderNodeWithoutSemiColon ||
            isImportUnknownValueEndsWithSemiColon
          ? ""
          : ";",
      ];
    }
    // postcss-media-query-parser
    case "media-query-list": {
      const parts = [];
      path.each(({ node }) => {
        if (node.type === "media-query" && node.value === "") {
          return;
        }
        parts.push(print());
      }, "nodes");

      return group(indent(join(line, parts)));
    }
    case "media-query":
      return [
        join(" ", path.map(print, "nodes")),
        isLastNode(path, node) ? "" : ",",
      ];

    case "media-type":
      return adjustNumbers(adjustStrings(node.value, options));

    case "media-feature-expression":
      if (!node.nodes) {
        return node.value;
      }
      return ["(", ...path.map(print, "nodes"), ")"];

    case "media-feature":
      return maybeToLowerCase(
        adjustStrings(node.value.replaceAll(/ +/g, " "), options)
      );

    case "media-colon":
      return [node.value, " "];

    case "media-value":
      return adjustNumbers(adjustStrings(node.value, options));

    case "media-keyword":
      return adjustStrings(node.value, options);

    case "media-url":
      return adjustStrings(
        node.value.replaceAll(/^url\(\s+/gi, "url(").replaceAll(/\s+\)$/g, ")"),
        options
      );

    case "media-unknown":
      return node.value;

    // postcss-selector-parser
    case "selector-root":
      return group([
        insideAtRuleNode(path, "custom-selector")
          ? [
              path.findAncestor((node) => node.type === "css-atrule")
                .customSelector,
              line,
            ]
          : "",
        join(
          [
            ",",
            insideAtRuleNode(path, ["extend", "custom-selector", "nest"])
              ? line
              : hardline,
          ],
          path.map(print, "nodes")
        ),
      ]);

    case "selector-selector":
      return group(indent(path.map(print, "nodes")));

    case "selector-comment":
      return node.value;

    case "selector-string":
      return adjustStrings(node.value, options);

    case "selector-tag":
      return [
        node.namespace
          ? [node.namespace === true ? "" : node.namespace.trim(), "|"]
          : "",
        path.previous?.type === "selector-nesting"
          ? node.value
          : adjustNumbers(
              isKeyframeAtRuleKeywords(path, node.value)
                ? node.value.toLowerCase()
                : node.value
            ),
      ];

    case "selector-id":
      return ["#", node.value];

    case "selector-class":
      return [".", adjustNumbers(adjustStrings(node.value, options))];

    case "selector-attribute":
      return [
        "[",
        node.namespace
          ? [node.namespace === true ? "" : node.namespace.trim(), "|"]
          : "",
        node.attribute.trim(),
        node.operator ?? "",
        node.value
          ? quoteAttributeValue(
              adjustStrings(node.value.trim(), options),
              options
            )
          : "",
        node.insensitive ? " i" : "",
        "]",
      ];

    case "selector-combinator": {
      if (
        node.value === "+" ||
        node.value === ">" ||
        node.value === "~" ||
        node.value === ">>>"
      ) {
        const parentNode = path.parent;
        const leading =
          parentNode.type === "selector-selector" &&
          parentNode.nodes[0] === node
            ? ""
            : line;

        return [leading, node.value, isLastNode(path, node) ? "" : " "];
      }

      const leading = node.value.trim().startsWith("(") ? line : "";
      const value =
        adjustNumbers(adjustStrings(node.value.trim(), options)) || line;

      return [leading, value];
    }
    case "selector-universal":
      return [
        node.namespace
          ? [node.namespace === true ? "" : node.namespace.trim(), "|"]
          : "",
        node.value,
      ];

    case "selector-pseudo":
      return [
        maybeToLowerCase(node.value),
        isNonEmptyArray(node.nodes)
          ? group([
              "(",
              indent([softline, join([",", line], path.map(print, "nodes"))]),
              softline,
              ")",
            ])
          : "",
      ];

    case "selector-nesting":
      return node.value;

    case "selector-unknown": {
      const ruleAncestorNode = path.findAncestor(
        (node) => node.type === "css-rule"
      );

      // Nested SCSS property
      if (ruleAncestorNode?.isSCSSNesterProperty) {
        return adjustNumbers(
          adjustStrings(maybeToLowerCase(node.value), options)
        );
      }

      // originalText has to be used for Less, see replaceQuotesInInlineComments in loc.js
      const parentNode = path.parent;
      if (parentNode.raws?.selector) {
        const start = locStart(parentNode);
        const end = start + parentNode.raws.selector.length;
        return options.originalText.slice(start, end).trim();
      }

      // Same reason above
      const grandParent = path.grandparent;
      if (
        parentNode.type === "value-paren_group" &&
        grandParent?.type === "value-func" &&
        grandParent.value === "selector"
      ) {
        const start = locEnd(parentNode.open) + 1;
        const end = locStart(parentNode.close);
        const selector = options.originalText.slice(start, end).trim();

        return lastLineHasInlineComment(selector)
          ? [breakParent, selector]
          : selector;
      }

      return node.value;
    }
    // postcss-values-parser
    case "value-value":
    case "value-root":
      return print("group");

    case "value-comment":
      return options.originalText.slice(locStart(node), locEnd(node));

    case "value-comma_group": {
      const parentNode = path.parent;
      const parentParentNode = path.grandparent;
      const declAncestorProp = getPropOfDeclNode(path);
      const isGridValue =
        declAncestorProp &&
        parentNode.type === "value-value" &&
        (declAncestorProp === "grid" ||
          declAncestorProp.startsWith("grid-template"));
      const atRuleAncestorNode = path.findAncestor(
        (node) => node.type === "css-atrule"
      );
      const isControlDirective =
        atRuleAncestorNode &&
        isSCSSControlDirectiveNode(atRuleAncestorNode, options);
      const hasInlineComment = node.groups.some((node) =>
        isInlineValueCommentNode(node)
      );

      const printed = path.map(print, "groups");
      const parts = [];
      const insideURLFunction = insideValueFunctionNode(path, "url");

      let insideSCSSInterpolationInString = false;
      let didBreak = false;

      for (let i = 0; i < node.groups.length; ++i) {
        parts.push(printed[i]);

        const iPrevNode = node.groups[i - 1];
        const iNode = node.groups[i];
        const iNextNode = node.groups[i + 1];
        const iNextNextNode = node.groups[i + 2];

        if (insideURLFunction) {
          if (
            (iNextNode && isAdditionNode(iNextNode)) ||
            isAdditionNode(iNode)
          ) {
            parts.push(" ");
          }
          continue;
        }

        // Ignore SCSS @forward wildcard suffix
        if (
          insideAtRuleNode(path, "forward") &&
          iNode.type === "value-word" &&
          iNode.value &&
          iPrevNode !== undefined &&
          iPrevNode.type === "value-word" &&
          iPrevNode.value === "as" &&
          iNextNode.type === "value-operator" &&
          iNextNode.value === "*"
        ) {
          continue;
        }

        // Ignore after latest node (i.e. before semicolon)
        if (!iNextNode) {
          continue;
        }

        // styled.div` background: var(--${one}); `
        if (
          iNode.type === "value-word" &&
          iNode.value.endsWith("-") &&
          isAtWordPlaceholderNode(iNextNode)
        ) {
          continue;
        }

        // Ignore spaces before/after string interpolation (i.e. `"#{my-fn("_")}"`)
        if (iNode.type === "value-string" && iNode.quoted) {
          const positionOfOpeningInterpolation = iNode.value.lastIndexOf("#{");
          const positionOfClosingInterpolation = iNode.value.lastIndexOf("}");
          if (
            positionOfOpeningInterpolation !== -1 &&
            positionOfClosingInterpolation !== -1
          ) {
            insideSCSSInterpolationInString =
              positionOfOpeningInterpolation > positionOfClosingInterpolation;
          } else if (positionOfOpeningInterpolation !== -1) {
            insideSCSSInterpolationInString = true;
          } else if (positionOfClosingInterpolation !== -1) {
            insideSCSSInterpolationInString = false;
          }
        }

        if (insideSCSSInterpolationInString) {
          continue;
        }

        // Ignore colon (i.e. `:`)
        if (isColonNode(iNode) || isColonNode(iNextNode)) {
          continue;
        }

        // Ignore `@` in Less (i.e. `@@var;`)
        if (
          iNode.type === "value-atword" &&
          (iNode.value === "" ||
            /*
            @var[ @notVarNested ][notVar]
            ^^^^^
            */
            iNode.value.endsWith("["))
        ) {
          continue;
        }

        /*
        @var[ @notVarNested ][notVar]
                            ^^^^^^^^^
        */
        if (
          iNextNode.type === "value-word" &&
          iNextNode.value.startsWith("]")
        ) {
          continue;
        }

        // Ignore `~` in Less (i.e. `content: ~"^//* some horrible but needed css hack";`)
        if (iNode.value === "~") {
          continue;
        }

        // Ignore escape `\`
        if (
          iNode.type !== "value-string" &&
          iNode.value &&
          iNode.value.includes("\\") &&
          iNextNode &&
          iNextNode.type !== "value-comment"
        ) {
          continue;
        }

        // Ignore escaped `/`
        if (
          iPrevNode?.value &&
          iPrevNode.value.indexOf("\\") === iPrevNode.value.length - 1 &&
          iNode.type === "value-operator" &&
          iNode.value === "/"
        ) {
          continue;
        }

        // Ignore `\` (i.e. `$variable: \@small;`)
        if (iNode.value === "\\") {
          continue;
        }

        // Ignore `$$` (i.e. `background-color: $$(style)Color;`)
        if (isPostcssSimpleVarNode(iNode, iNextNode)) {
          continue;
        }

        // Ignore spaces after `#` and after `{` and before `}` in SCSS interpolation (i.e. `#{variable}`)
        if (
          isHashNode(iNode) ||
          isLeftCurlyBraceNode(iNode) ||
          isRightCurlyBraceNode(iNextNode) ||
          (isLeftCurlyBraceNode(iNextNode) && hasEmptyRawBefore(iNextNode)) ||
          (isRightCurlyBraceNode(iNode) && hasEmptyRawBefore(iNextNode))
        ) {
          continue;
        }

        // Ignore css variables and interpolation in SCSS (i.e. `--#{$var}`)
        if (iNode.value === "--" && isHashNode(iNextNode)) {
          continue;
        }

        // Formatting math operations
        const isMathOperator = isMathOperatorNode(iNode);
        const isNextMathOperator = isMathOperatorNode(iNextNode);

        // Print spaces before and after math operators beside SCSS interpolation as is
        // (i.e. `#{$var}+5`, `#{$var} +5`, `#{$var}+ 5`, `#{$var} + 5`)
        // (i.e. `5+#{$var}`, `5 +#{$var}`, `5+ #{$var}`, `5 + #{$var}`)
        if (
          ((isMathOperator && isHashNode(iNextNode)) ||
            (isNextMathOperator && isRightCurlyBraceNode(iNode))) &&
          hasEmptyRawBefore(iNextNode)
        ) {
          continue;
        }

        // absolute paths are only parsed as one token if they are part of url(/abs/path) call
        // but if you have custom -fb-url(/abs/path/) then it is parsed as "division /" and rest
        // of the path. We don't want to put a space after that first division in this case.
        if (!iPrevNode && isDivisionNode(iNode)) {
          continue;
        }

        // Print spaces before and after addition and subtraction math operators as is in `calc` function
        // due to the fact that it is not valid syntax
        // (i.e. `calc(1px+1px)`, `calc(1px+ 1px)`, `calc(1px +1px)`, `calc(1px + 1px)`)
        if (
          insideValueFunctionNode(path, "calc") &&
          (isAdditionNode(iNode) ||
            isAdditionNode(iNextNode) ||
            isSubtractionNode(iNode) ||
            isSubtractionNode(iNextNode)) &&
          hasEmptyRawBefore(iNextNode)
        ) {
          continue;
        }

        // Print spaces after `+` and `-` in color adjuster functions as is (e.g. `color(red l(+ 20%))`)
        // Adjusters with signed numbers (e.g. `color(red l(+20%))`) output as-is.
        const isColorAdjusterNode =
          (isAdditionNode(iNode) || isSubtractionNode(iNode)) &&
          i === 0 &&
          (iNextNode.type === "value-number" || iNextNode.isHex) &&
          parentParentNode &&
          isColorAdjusterFuncNode(parentParentNode) &&
          !hasEmptyRawBefore(iNextNode);

        const requireSpaceBeforeOperator =
          iNextNextNode?.type === "value-func" ||
          (iNextNextNode && isWordNode(iNextNextNode)) ||
          iNode.type === "value-func" ||
          isWordNode(iNode);
        const requireSpaceAfterOperator =
          iNextNode.type === "value-func" ||
          isWordNode(iNextNode) ||
          iPrevNode?.type === "value-func" ||
          (iPrevNode && isWordNode(iPrevNode));

        // Formatting `/`, `+`, `-` sign
        if (
          !(isMultiplicationNode(iNextNode) || isMultiplicationNode(iNode)) &&
          !insideValueFunctionNode(path, "calc") &&
          !isColorAdjusterNode &&
          ((isDivisionNode(iNextNode) && !requireSpaceBeforeOperator) ||
            (isDivisionNode(iNode) && !requireSpaceAfterOperator) ||
            (isAdditionNode(iNextNode) && !requireSpaceBeforeOperator) ||
            (isAdditionNode(iNode) && !requireSpaceAfterOperator) ||
            isSubtractionNode(iNextNode) ||
            isSubtractionNode(iNode)) &&
          (hasEmptyRawBefore(iNextNode) ||
            (isMathOperator &&
              (!iPrevNode || (iPrevNode && isMathOperatorNode(iPrevNode)))))
        ) {
          continue;
        }

        // No space before unary minus followed by an opening parenthesis `-(`
        if (
          (options.parser === "scss" || options.parser === "less") &&
          isMathOperator &&
          iNode.value === "-" &&
          isParenGroupNode(iNextNode) &&
          locEnd(iNode) === locStart(iNextNode.open) &&
          iNextNode.open.value === "("
        ) {
          continue;
        }

        // Add `hardline` after inline comment (i.e. `// comment\n foo: bar;`)
        if (isInlineValueCommentNode(iNode)) {
          if (parentNode.type === "value-paren_group") {
            parts.push(dedent(hardline));
            continue;
          }
          parts.push(hardline);
          continue;
        }

        // Handle keywords in SCSS control directive
        if (
          isControlDirective &&
          (isEqualityOperatorNode(iNextNode) ||
            isRelationalOperatorNode(iNextNode) ||
            isIfElseKeywordNode(iNextNode) ||
            isEachKeywordNode(iNode) ||
            isForKeywordNode(iNode))
        ) {
          parts.push(" ");

          continue;
        }

        // At-rule `namespace` should be in one line
        if (
          atRuleAncestorNode &&
          atRuleAncestorNode.name.toLowerCase() === "namespace"
        ) {
          parts.push(" ");

          continue;
        }

        // Formatting `grid` property
        if (isGridValue) {
          if (
            iNode.source &&
            iNextNode.source &&
            iNode.source.start.line !== iNextNode.source.start.line
          ) {
            parts.push(hardline);

            didBreak = true;
          } else {
            parts.push(" ");
          }

          continue;
        }

        // Add `space` before next math operation
        // Note: `grip` property have `/` delimiter and it is not math operation, so
        // `grid` property handles above
        if (isNextMathOperator) {
          parts.push(" ");

          continue;
        }
        // allow function(returns-list($list)...)
        if (iNextNode?.value === "...") {
          continue;
        }

        if (
          isAtWordPlaceholderNode(iNode) &&
          isAtWordPlaceholderNode(iNextNode) &&
          locEnd(iNode) === locStart(iNextNode)
        ) {
          continue;
        }

        if (
          isAtWordPlaceholderNode(iNode) &&
          isParenGroupNode(iNextNode) &&
          locEnd(iNode) === locStart(iNextNode.open)
        ) {
          parts.push(softline);
          continue;
        }

        if (iNode.value === "with" && isParenGroupNode(iNextNode)) {
          parts.push(" ");
          continue;
        }

        if (
          iNode.value?.endsWith("#") &&
          iNextNode.value === "{" &&
          isParenGroupNode(iNextNode.group)
        ) {
          continue;
        }

        // Be default all values go through `line`
        parts.push(line);
      }

      if (hasInlineComment) {
        parts.push(breakParent);
      }

      if (didBreak) {
        parts.unshift(hardline);
      }

      if (isControlDirective) {
        return group(indent(parts));
      }

      // Indent is not needed for import url when url is very long
      // and node has two groups
      // when type is value-comma_group
      // example @import url("verylongurl") projection,tv
      if (insideURLFunctionInImportAtRuleNode(path)) {
        return group(fill(parts));
      }

      return group(indent(fill(parts)));
    }
    case "value-paren_group": {
      const parentNode = path.parent;
      const printedGroups = path.map(() => {
        const child = path.node;
        return typeof child === "string" ? child : print();
      }, "groups");

      if (
        parentNode &&
        isURLFunctionNode(parentNode) &&
        (node.groups.length === 1 ||
          (node.groups.length > 0 &&
            node.groups[0].type === "value-comma_group" &&
            node.groups[0].groups.length > 0 &&
            node.groups[0].groups[0].type === "value-word" &&
            node.groups[0].groups[0].value.startsWith("data:")))
      ) {
        return [
          node.open ? print("open") : "",
          join(",", printedGroups),
          node.close ? print("close") : "",
        ];
      }

      if (!node.open) {
        return group(indent(fill(join([",", line], printedGroups))));
      }

      const isSCSSMapItem = isSCSSMapItemNode(path, options);

      const lastItem = node.groups.at(-1);
      const isLastItemComment = lastItem?.type === "value-comment";
      const isKey = isKeyInValuePairNode(node, parentNode);
      const isConfiguration = isConfigurationNode(node, parentNode);
      const isVarFunction = isVarFunctionNode(parentNode);

      const shouldBreak = isConfiguration || (isSCSSMapItem && !isKey);
      const shouldDedent = isConfiguration || isKey;

      const printed = group(
        [
          node.open ? print("open") : "",
          indent([
            softline,
            join(
              [line],
              path.map(({ node: child, isLast, index }) => {
                const hasComma = () =>
                  Boolean(
                    child.source &&
                      options.originalText
                        .slice(locStart(child), locStart(node.close))
                        .trimEnd()
                        .endsWith(",")
                  );
                const shouldPrintComma =
                  !isLast || (isVarFunction && hasComma());
                let printed = [
                  printedGroups[index],
                  shouldPrintComma ? "," : "",
                ];

                // Key/Value pair in open paren already indented
                if (
                  isKeyValuePairNode(child) &&
                  child.type === "value-comma_group" &&
                  child.groups &&
                  child.groups[0].type !== "value-paren_group" &&
                  child.groups[2]?.type === "value-paren_group"
                ) {
                  const parts = getDocParts(printed[0].contents.contents);
                  parts[1] = group(parts[1]);
                  printed = [group(dedent(printed))];
                }

                if (
                  !isLast &&
                  child.type === "value-comma_group" &&
                  isNonEmptyArray(child.groups)
                ) {
                  let last = child.groups.at(-1);

                  // `value-paren_group` does not have location info, but its closing parenthesis does.
                  if (!last.source && last.close) {
                    last = last.close;
                  }

                  if (
                    last.source &&
                    isNextLineEmpty(options.originalText, last, locEnd)
                  ) {
                    printed.push(hardline);
                  }
                }

                return printed;
              }, "groups")
            ),
          ]),
          ifBreak(
            !isLastItemComment &&
              options.parser === "scss" &&
              isSCSSMapItem &&
              shouldPrintComma(options)
              ? ","
              : ""
          ),
          softline,
          node.close ? print("close") : "",
        ],
        {
          shouldBreak,
        }
      );

      return shouldDedent ? dedent(printed) : printed;
    }
    case "value-func":
      return [
        node.value,
        insideAtRuleNode(path, "supports") && isMediaAndSupportsKeywords(node)
          ? " "
          : "",
        print("group"),
      ];

    case "value-paren":
      return node.value;

    case "value-number":
      return [printCssNumber(node.value), printUnit(node.unit)];

    case "value-operator":
      return node.value;

    case "value-word":
      if ((node.isColor && node.isHex) || isWideKeywords(node.value)) {
        return node.value.toLowerCase();
      }

      return node.value;

    case "value-colon": {
      const { previous } = path;
      return [
        node.value,
        // Don't add spaces on escaped colon `:`, e.g: grid-template-rows: [row-1-00\:00] auto;
        (typeof previous?.value === "string" &&
          previous.value.endsWith("\\")) ||
        // Don't add spaces on `:` in `url` function (i.e. `url(fbglyph: cross-outline, fig-white)`)
        insideValueFunctionNode(path, "url")
          ? ""
          : line,
      ];
    }
    case "value-string":
      return printString(
        node.raws.quote + node.value + node.raws.quote,
        options
      );

    case "value-atword":
      return ["@", node.value];

    case "value-unicode-range":
      return node.value;

    case "value-unknown":
      return node.value;

    case "value-comma": // Handled in `value-comma_group`
    default:
      /* c8 ignore next */
      throw new UnexpectedNodeError(node, "PostCSS");
  }
}

function printNodeSequence(path, options, print) {
  const parts = [];
  path.each(() => {
    const { node, previous } = path;
    if (
      previous?.type === "css-comment" &&
      previous.text.trim() === "prettier-ignore"
    ) {
      parts.push(options.originalText.slice(locStart(node), locEnd(node)));
    } else {
      parts.push(print());
    }

    if (path.isLast) {
      return;
    }

    const { next } = path;
    if (
      (next.type === "css-comment" &&
        !hasNewline(options.originalText, locStart(next), {
          backwards: true,
        }) &&
        !isFrontMatterNode(node)) ||
      (next.type === "css-atrule" &&
        next.name === "else" &&
        node.type !== "css-comment")
    ) {
      parts.push(" ");
    } else {
      parts.push(options.__isHTMLStyleAttribute ? line : hardline);
      if (
        isNextLineEmpty(options.originalText, node, locEnd) &&
        !isFrontMatterNode(node)
      ) {
        parts.push(hardline);
      }
    }
  }, "nodes");

  return parts;
}

const STRING_REGEX = /(["'])(?:(?!\1)[^\\]|\\.)*\1/gs;
const NUMBER_REGEX = /(?:\d*\.\d+|\d+\.?)(?:[Ee][+-]?\d+)?/g;
const STANDARD_UNIT_REGEX = /[A-Za-z]+/g;
const WORD_PART_REGEX = /[$@]?[A-Z_a-z\u0080-\uFFFF][\w\u0080-\uFFFF-]*/g;
const ADJUST_NUMBERS_REGEX = new RegExp(
  STRING_REGEX.source +
    "|" +
    `(${WORD_PART_REGEX.source})?` +
    `(${NUMBER_REGEX.source})` +
    `(${STANDARD_UNIT_REGEX.source})?`,
  "g"
);

function adjustStrings(value, options) {
  return value.replaceAll(STRING_REGEX, (match) => printString(match, options));
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
        ? printCssNumber(number) + maybeToLowerCase(unit || "")
        : match
  );
}

function printCssNumber(rawNumber) {
  return (
    printNumber(rawNumber)
      // Remove trailing `.0`.
      .replace(/\.0(?=$|e)/, "")
  );
}

const printer = {
  print: genericPrint,
  embed,
  insertPragma,
  massageAstNode: clean,
  getVisitorKeys,
};

export default printer;
