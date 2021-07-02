"use strict";

const { printDanglingComments } = require("../../main/comments");
const { getLast, getPenultimate } = require("../../common/util");
const {
  getFunctionParameters,
  // [prettierx] --space-in-parens option support (...)
  hasAddedLine,
  hasComment,
  CommentCheckFlags,
  isFunctionCompositionArgs,
  isJsxNode,
  isLongCurriedCallExpression,
  shouldPrintComma,
  getCallArguments,
  iterateCallArgumentsPath,
  isNextLineEmpty,
  isCallExpression,
  isStringLiteral,
  isObjectProperty,
} = require("../utils");

const {
  builders: {
    line,
    hardline,
    softline,
    group,
    indent,
    conditionalGroup,
    ifBreak,
    breakParent,
  },
  utils: { willBreak },
} = require("../../document");

const { ArgExpansionBailout } = require("../../common/errors");
const { isConciselyPrintedArray } = require("./array");

function printCallArguments(path, options, print) {
  const node = path.getValue();
  const isDynamicImport = node.type === "ImportExpression";

  // [prettierx] for --space-in-parens option support (...)
  const insideSpace = options.spaceInParens ? " " : "";
  const innerLineBreak = options.spaceInParens ? line : softline;

  const args = getCallArguments(node);
  if (args.length === 0) {
    return [
      "(",
      printDanglingComments(path, options, /* sameIndent */ true),
      ")",
    ];
  }

  // useEffect(() => { ... }, [foo, bar, baz])
  if (isReactHookCallWithDepsArray(args)) {
    // [prettierx] with --space-in-parens option support (...)
    return [
      "(",
      insideSpace,
      print(["arguments", 0]),
      ", ",
      print(["arguments", 1]),
      insideSpace,
      ")",
    ];
  }

  let anyArgEmptyLine = false;
  let hasEmptyLineFollowingFirstArg = false;
  const lastArgIndex = args.length - 1;
  const printedArguments = [];
  iterateCallArgumentsPath(path, (argPath, index) => {
    const arg = argPath.getNode();
    const parts = [print()];

    if (index === lastArgIndex) {
      // do nothing
    } else if (isNextLineEmpty(arg, options)) {
      if (index === 0) {
        hasEmptyLineFollowingFirstArg = true;
      }

      anyArgEmptyLine = true;
      parts.push(",", hardline, hardline);
    } else {
      parts.push(",", line);
    }

    printedArguments.push(parts);
  });

  const maybeTrailingComma =
    // Dynamic imports cannot have trailing commas
    !(isDynamicImport || (node.callee && node.callee.type === "Import")) &&
    shouldPrintComma(options, "all")
      ? ","
      : "";

  // [prettierx] with lastArgAddedLine arg for --space-in-parens option support
  function allArgsBrokenOut(lastArgAddedLine) {
    return group(
      [
        "(",
        // [prettierx] keep break here, regardless of --space-in-parens option
        indent([line, ...printedArguments]),
        maybeTrailingComma,
        // [prettierx] keep break here, unless lastArgAddedLine is true
        lastArgAddedLine ? "" : line,
        ")",
      ],
      { shouldBreak: true }
    );
  }

  if (
    anyArgEmptyLine ||
    (path.getParentNode().type !== "Decorator" &&
      isFunctionCompositionArgs(args))
  ) {
    return allArgsBrokenOut();
  }

  // [prettierx] with --space-in-parens option support below (...)
  const shouldGroupFirst = shouldGroupFirstArg(args);
  const shouldGroupLast = shouldGroupLastArg(args, options);
  if (shouldGroupFirst || shouldGroupLast) {
    if (
      shouldGroupFirst
        ? printedArguments.slice(1).some(willBreak)
        : printedArguments.slice(0, -1).some(willBreak)
    ) {
      return allArgsBrokenOut();
    }

    // We want to print the last argument with a special flag
    let printedExpanded = [];

    // [prettierx] keep for --space-in-parens option support (...)
    let lastArgAddedLine = false;

    try {
      path.try(() => {
        iterateCallArgumentsPath(path, (argPath, i) => {
          if (shouldGroupFirst && i === 0) {
            printedExpanded = [
              [
                print([], { expandFirstArg: true }),
                printedArguments.length > 1 ? "," : "",
                hasEmptyLineFollowingFirstArg ? hardline : line,
                hasEmptyLineFollowingFirstArg ? hardline : "",
              ],
              ...printedArguments.slice(1),
            ];
          }
          if (shouldGroupLast && i === lastArgIndex) {
            // [prettierx] with --space-in-parens option support (...)

            // [prettierx] keep for --space-in-parens option support (...)
            const printedLastArg = print(argPath, { expandLastArg: true });

            // [prettierx] with --space-in-parens option support (...)
            lastArgAddedLine = hasAddedLine(printedLastArg);

            printedExpanded = [
              ...printedArguments.slice(0, -1),
              print([], { expandLastArg: true }),
            ];
          }
        });
      });
    } catch (caught) {
      if (caught instanceof ArgExpansionBailout) {
        return allArgsBrokenOut();
      }
      /* istanbul ignore next */
      throw caught;
    }

    return [
      printedArguments.some(willBreak) ? breakParent : "",
      // [prettierx] with --space-in-parens option support (...)
      conditionalGroup([
        [
          "(",
          // [prettierx] --space-in-parens option support (...)
          insideSpace,
          ...printedExpanded,
          // [prettierx] --space-in-parens option support (...)
          lastArgAddedLine ? "" : insideSpace,
          ")",
        ],
        shouldGroupFirst
          ? [
              "(",
              // [prettierx] --space-in-parens option support (...)
              insideSpace,
              group(printedExpanded[0], { shouldBreak: true }),
              ...printedExpanded.slice(1),
              // [prettierx] --space-in-parens option support (...)
              insideSpace,
              ")",
            ]
          : [
              "(",
              // [prettierx] --space-in-parens option support (...)
              insideSpace,
              ...printedArguments.slice(0, -1),
              group(getLast(printedExpanded), { shouldBreak: true }),
              // [prettierx] --space-in-parens option support (...)
              lastArgAddedLine ? "" : insideSpace,
              ")",
            ],
        allArgsBrokenOut(lastArgAddedLine),
      ]),
    ];
  }

  // [prettierx] with --space-in-parens option support (...)
  const contents = [
    "(",
    // [prettierx] --space-in-parens option support (...)
    indent([innerLineBreak, ...printedArguments]),
    ifBreak(maybeTrailingComma),
    // [prettierx] --space-in-parens option support (...)
    innerLineBreak,
    ")",
  ];
  if (isLongCurriedCallExpression(path)) {
    // By not wrapping the arguments in a group, the printer prioritizes
    // breaking up these arguments rather than the args of the parent call.
    return contents;
  }

  return group(contents, {
    shouldBreak: printedArguments.some(willBreak) || anyArgEmptyLine,
  });
}

function couldGroupArg(arg, arrowChainRecursion = false) {
  return (
    (arg.type === "ObjectExpression" &&
      (arg.properties.length > 0 || hasComment(arg))) ||
    (arg.type === "ArrayExpression" &&
      (arg.elements.length > 0 || hasComment(arg))) ||
    (arg.type === "TSTypeAssertion" && couldGroupArg(arg.expression)) ||
    (arg.type === "TSAsExpression" && couldGroupArg(arg.expression)) ||
    arg.type === "FunctionExpression" ||
    (arg.type === "ArrowFunctionExpression" &&
      // we want to avoid breaking inside composite return types but not simple keywords
      // https://github.com/prettier/prettier/issues/4070
      // export class Thing implements OtherThing {
      //   do: (type: Type) => Provider<Prop> = memoize(
      //     (type: ObjectType): Provider<Opts> => {}
      //   );
      // }
      // https://github.com/prettier/prettier/issues/6099
      // app.get("/", (req, res): void => {
      //   res.send("Hello World!");
      // });
      (!arg.returnType ||
        !arg.returnType.typeAnnotation ||
        arg.returnType.typeAnnotation.type !== "TSTypeReference" ||
        // https://github.com/prettier/prettier/issues/7542
        isNonEmptyBlockStatement(arg.body)) &&
      (arg.body.type === "BlockStatement" ||
        (arg.body.type === "ArrowFunctionExpression" &&
          couldGroupArg(arg.body, true)) ||
        arg.body.type === "ObjectExpression" ||
        arg.body.type === "ArrayExpression" ||
        (!arrowChainRecursion &&
          (isCallExpression(arg.body) ||
            arg.body.type === "ConditionalExpression")) ||
        isJsxNode(arg.body))) ||
    arg.type === "DoExpression" ||
    arg.type === "ModuleExpression"
  );
}

function shouldGroupLastArg(args, options) {
  const lastArg = getLast(args);
  const penultimateArg = getPenultimate(args);
  return (
    !hasComment(lastArg, CommentCheckFlags.Leading) &&
    !hasComment(lastArg, CommentCheckFlags.Trailing) &&
    couldGroupArg(lastArg) &&
    // If the last two arguments are of the same type,
    // disable last element expansion.
    (!penultimateArg || penultimateArg.type !== lastArg.type) &&
    // useMemo(() => func(), [foo, bar, baz])
    (args.length !== 2 ||
      penultimateArg.type !== "ArrowFunctionExpression" ||
      lastArg.type !== "ArrayExpression") &&
    !(
      args.length > 1 &&
      lastArg.type === "ArrayExpression" &&
      isConciselyPrintedArray(lastArg, options)
    )
  );
}

function shouldGroupFirstArg(args) {
  if (args.length !== 2) {
    return false;
  }

  const [firstArg, secondArg] = args;

  if (
    firstArg.type === "ModuleExpression" &&
    isTypeModuleObjectExpression(secondArg)
  ) {
    return true;
  }

  return (
    !hasComment(firstArg) &&
    (firstArg.type === "FunctionExpression" ||
      (firstArg.type === "ArrowFunctionExpression" &&
        firstArg.body.type === "BlockStatement")) &&
    secondArg.type !== "FunctionExpression" &&
    secondArg.type !== "ArrowFunctionExpression" &&
    secondArg.type !== "ConditionalExpression" &&
    !couldGroupArg(secondArg)
  );
}

function isReactHookCallWithDepsArray(args) {
  return (
    args.length === 2 &&
    args[0].type === "ArrowFunctionExpression" &&
    getFunctionParameters(args[0]).length === 0 &&
    args[0].body.type === "BlockStatement" &&
    args[1].type === "ArrayExpression" &&
    !args.some((arg) => hasComment(arg))
  );
}

function isNonEmptyBlockStatement(node) {
  return (
    node.type === "BlockStatement" &&
    (node.body.some((node) => node.type !== "EmptyStatement") ||
      hasComment(node, CommentCheckFlags.Dangling))
  );
}

// { type: "module" }
function isTypeModuleObjectExpression(node) {
  return (
    node.type === "ObjectExpression" &&
    node.properties.length === 1 &&
    isObjectProperty(node.properties[0]) &&
    node.properties[0].key.type === "Identifier" &&
    node.properties[0].key.name === "type" &&
    isStringLiteral(node.properties[0].value) &&
    node.properties[0].value.value === "module"
  );
}

module.exports = printCallArguments;
