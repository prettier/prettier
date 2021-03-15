"use strict";

const { printDanglingComments } = require("../../main/comments");
const { getLast, getPenultimate } = require("../../common/util");
const {
  getFunctionParameters,
  iterateFunctionParametersPath,
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

const { isConciselyPrintedArray } = require("./array");

function printCallArguments(path, options, print) {
  const node = path.getValue();
  const isDynamicImport = node.type === "ImportExpression";

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
    return [
      "(",
      path.call(print, "arguments", 0),
      ", ",
      path.call(print, "arguments", 1),
      ")",
    ];
  }

  // func(
  //   ({
  //     a,
  //
  //     b
  //   }) => {}
  // );
  function shouldBreakForArrowFunctionInArguments(arg, argPath) {
    if (
      !arg ||
      arg.type !== "ArrowFunctionExpression" ||
      !arg.body ||
      arg.body.type !== "BlockStatement" ||
      getFunctionParameters(arg).length === 0
    ) {
      return false;
    }

    let shouldBreak = false;
    iterateFunctionParametersPath(argPath, (parameterPath) => {
      shouldBreak = shouldBreak || willBreak(print(parameterPath));
    });

    return shouldBreak;
  }

  let anyArgEmptyLine = false;
  let shouldBreakForArrowFunction = false;
  let hasEmptyLineFollowingFirstArg = false;
  const lastArgIndex = args.length - 1;
  const printedArguments = [];
  iterateCallArgumentsPath(path, (argPath, index) => {
    const arg = argPath.getNode();
    const parts = [print(argPath)];

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

    shouldBreakForArrowFunction = shouldBreakForArrowFunctionInArguments(
      arg,
      argPath
    );

    printedArguments.push(parts);
  });

  const maybeTrailingComma =
    // Dynamic imports cannot have trailing commas
    !(isDynamicImport || (node.callee && node.callee.type === "Import")) &&
    shouldPrintComma(options, "all")
      ? ","
      : "";

  function allArgsBrokenOut() {
    return group(
      ["(", indent([line, ...printedArguments]), maybeTrailingComma, line, ")"],
      { shouldBreak: true }
    );
  }

  if (
    path.getParentNode().type !== "Decorator" &&
    isFunctionCompositionArgs(args)
  ) {
    return allArgsBrokenOut();
  }

  const shouldGroupFirst = shouldGroupFirstArg(args);
  const shouldGroupLast = shouldGroupLastArg(args, options);
  if (shouldGroupFirst || shouldGroupLast) {
    const shouldBreak =
      (shouldGroupFirst
        ? printedArguments.slice(1).some(willBreak)
        : printedArguments.slice(0, -1).some(willBreak)) ||
      anyArgEmptyLine ||
      shouldBreakForArrowFunction;

    // We want to print the last argument with a special flag
    let printedExpanded = [];
    iterateCallArgumentsPath(path, (argPath, i) => {
      if (shouldGroupFirst && i === 0) {
        printedExpanded = [
          [
            print(argPath, { expandFirstArg: true }),
            printedArguments.length > 1 ? "," : "",
            hasEmptyLineFollowingFirstArg ? hardline : line,
            hasEmptyLineFollowingFirstArg ? hardline : "",
          ],
          ...printedArguments.slice(1),
        ];
      }
      if (shouldGroupLast && i === args.length - 1) {
        printedExpanded = [
          ...printedArguments.slice(0, -1),
          print(argPath, { expandLastArg: true }),
        ];
      }
    });

    const somePrintedArgumentsWillBreak = printedArguments.some(willBreak);

    const simpleConcat = ["(", ...printedExpanded, ")"];

    return [
      somePrintedArgumentsWillBreak ? breakParent : "",
      conditionalGroup(
        [
          !somePrintedArgumentsWillBreak &&
          !node.typeArguments &&
          !node.typeParameters
            ? simpleConcat
            : ifBreak(allArgsBrokenOut(), simpleConcat),
          shouldGroupFirst
            ? [
                "(",
                group(printedExpanded[0], { shouldBreak: true }),
                ...printedExpanded.slice(1),
                ")",
              ]
            : [
                "(",
                ...printedArguments.slice(0, -1),
                group(getLast(printedExpanded), {
                  shouldBreak: true,
                }),
                ")",
              ],
          allArgsBrokenOut(),
        ],
        { shouldBreak }
      ),
    ];
  }

  const contents = [
    "(",
    indent([softline, ...printedArguments]),
    ifBreak(maybeTrailingComma),
    softline,
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
        isJsxNode(arg.body)))
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

module.exports = printCallArguments;
