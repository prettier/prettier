import {
  align,
  group,
  hardline,
  ifBreak,
  indent,
  join,
  line,
  softline,
} from "../../document/index.js";
import {
  printComments,
  printDanglingComments,
} from "../../main/comments/print.js";
import needsParentheses from "../parentheses/needs-parentheses.js";
import {
  CommentCheckFlags,
  createTypeCheckFunction,
  hasComment,
  hasLeadingOwnLineComment,
  isNextLineEmpty,
} from "../utilities/index.js";

/*
- `MatchExpression` (Flow)
- `MatchStatement` (Flow)
*/
export function printMatch(path, options, print) {
  const { node } = path;
  return [
    group(["match (", indent([softline, print("argument")]), softline, ")"]),
    " {",
    node.cases.length > 0
      ? indent([
          hardline,
          join(
            hardline,
            path.map(
              ({ node, isLast }) => [
                print(),
                !isLast && isNextLineEmpty(node, options) ? hardline : "",
              ],
              "cases",
            ),
          ),
        ])
      : "",
    hardline,
    "}",
  ];
}

/*
- `MatchExpressionCase` (Flow)
- `MatchStatementCase` (Flow)
*/
export function printMatchCase(path, options, print) {
  const { node } = path;

  const comment = hasComment(node, CommentCheckFlags.Dangling)
    ? [" ", printDanglingComments(path, options)]
    : [];

  const body =
    node.type === "MatchStatementCase"
      ? [" ", print("body")]
      : indent([line, print("body"), ","]);

  return [
    print("pattern"),
    node.guard ? group([indent([line, "if (", print("guard"), ")"])]) : "",
    group([" =>", comment, body]),
  ];
}

/*
- `MatchOrPattern` (Flow)
- `MatchAsPattern` (Flow)
- `MatchWildcardPattern` (Flow)
- `MatchLiteralPattern` (Flow)
- `MatchUnaryPattern` (Flow)
- `MatchIdentifierPattern` (Flow)
- `MatchMemberPattern` (Flow)
- `MatchBindingPattern` (Flow)
- `MatchObjectPattern` (Flow)
- `MatchArrayPattern` (Flow)
- `MatchObjectPatternProperty` (Flow)
- `MatchRestPattern` (Flow)
*/
export function printMatchPattern(path, options, print) {
  const { node } = path;

  switch (node.type) {
    case "MatchOrPattern":
      return printMatchOrPattern(path, options, print);
    case "MatchAsPattern":
      return [print("pattern"), " as ", print("target")];
    case "MatchWildcardPattern":
      return ["_"];
    case "MatchLiteralPattern":
      return print("literal");
    case "MatchUnaryPattern":
      return [node.operator, print("argument")];
    case "MatchIdentifierPattern":
      return print("id");
    case "MatchMemberPattern": {
      const property =
        node.property.type === "Identifier"
          ? [".", print("property")]
          : ["[", indent([softline, print("property")]), softline, "]"];
      return group([print("base"), property]);
    }
    case "MatchBindingPattern":
      return [node.kind, " ", print("id")];
    case "MatchObjectPattern":
    case "MatchInstanceObjectPattern":
      return printMatchObjectPattern(path, options, print);
    case "MatchInstancePattern":
      return group([print("targetConstructor"), " ", print("properties")]);

    case "MatchArrayPattern": {
      const elements = path.map(print, "elements");
      if (node.rest) {
        elements.push(print("rest"));
      }
      return group([
        "[",
        indent([softline, join([",", line], elements)]),
        node.rest ? "" : ifBreak(","),
        softline,
        "]",
      ]);
    }
    case "MatchObjectPatternProperty":
      if (node.shorthand) {
        return print("pattern");
      }
      return group([print("key"), ":", indent([line, print("pattern")])]);
    case "MatchRestPattern": {
      const parts = ["..."];
      if (node.argument) {
        parts.push(print("argument"));
      }
      return parts;
    }
  }
}

function printMatchObjectPattern(path, options, print) {
  const { node } = path;
  const properties = path.map(print, "properties");
  if (node.rest) {
    properties.push(print("rest"));
  }
  return group([
    "{",
    indent([softline, join([",", line], properties)]),
    node.rest ? "" : ifBreak(","),
    softline,
    "}",
  ]);
}

const isSimpleMatchPattern = createTypeCheckFunction([
  "MatchWildcardPattern",
  "MatchLiteralPattern",
  "MatchUnaryPattern",
  "MatchIdentifierPattern",
]);

function shouldHugMatchOrPattern(node) {
  const { patterns } = node;
  if (patterns.some((node) => hasComment(node))) {
    return false;
  }

  const objectPattern = patterns.find(
    (node) => node.type === "MatchObjectPattern",
  );
  if (!objectPattern) {
    return false;
  }

  return patterns.every(
    (node) => node === objectPattern || isSimpleMatchPattern(node),
  );
}

function shouldHugMatchPattern(node) {
  if (isSimpleMatchPattern(node) || node.type === "MatchObjectPattern") {
    return true;
  }

  if (node.type === "MatchOrPattern") {
    return shouldHugMatchOrPattern(node);
  }

  return false;
}

function printMatchOrPattern(path, options, print) {
  const { node } = path;
  // single-line variation
  // A | B | C

  // multi-line variation
  // | A
  // | B
  // | C

  const { parent } = path;

  const shouldIndent =
    parent.type !== "MatchStatementCase" &&
    parent.type !== "MatchExpressionCase" &&
    parent.type !== "MatchArrayPattern" &&
    parent.type !== "MatchObjectPatternProperty" &&
    !hasLeadingOwnLineComment(options.originalText, node);

  // {
  //   a: foo
  // } | null | void
  // should be inlined and not be printed in the multi-line variant
  const shouldHug = shouldHugMatchPattern(node);

  // We want to align the children but without its comment, so it looks like
  // | child1
  // // comment
  // | child2
  const printed = path.map(() => {
    let printedPattern = print();
    if (!shouldHug) {
      printedPattern = align(2, printedPattern);
    }
    return printComments(path, printedPattern, options);
  }, "patterns");

  if (shouldHug) {
    return join(" | ", printed);
  }

  const code = [ifBreak(["| "]), join([line, "| "], printed)];

  if (needsParentheses(path, options)) {
    return group([indent([ifBreak([softline]), code]), softline]);
  }

  if (parent.type === "MatchArrayPattern" && parent.elements.length > 1) {
    return group([
      indent([ifBreak(["(", softline]), code]),
      softline,
      ifBreak(")"),
    ]);
  }

  return group(shouldIndent ? indent(code) : code);
}
