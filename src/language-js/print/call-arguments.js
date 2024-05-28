import { ArgExpansionBailout } from "../../common/errors.js";
import {
  breakParent,
  conditionalGroup,
  group,
  hardline,
  ifBreak,
  indent,
  line,
  softline,
} from "../../document/builders.js";
import { willBreak } from "../../document/utils.js";
import { printDanglingComments } from "../../main/comments/print.js";
import {
  CommentCheckFlags,
  getCallArguments,
  getCallArgumentSelector,
  getFunctionParameters,
  hasComment,
  isArrayOrTupleExpression,
  isBinaryCastExpression,
  isBinaryish,
  isCallExpression,
  isCallLikeExpression,
  isFunctionCompositionArgs,
  isJsxElement,
  isLongCurriedCallExpression,
  isNextLineEmpty,
  isObjectOrRecordExpression,
  isObjectProperty,
  isRegExpLiteral,
  isSimpleCallArgument,
  isSimpleType,
  isStringLiteral,
  iterateCallArgumentsPath,
  shouldPrintComma,
} from "../utils/index.js";
import { isConciselyPrintedArray } from "./array.js";

function printCallArguments(path, options, print) {
  const { node } = path;

  const args = getCallArguments(node);
  if (args.length === 0) {
    return ["(", printDanglingComments(path, options), ")"];
  }

  const lastArgIndex = args.length - 1;

  // useEffect(() => { ... }, [foo, bar, baz])
  // useImperativeHandle(ref, () => { ... }, [foo, bar, baz])
  if (isReactHookCallWithDepsArray(args)) {
    const parts = ["("];
    iterateCallArgumentsPath(path, (path, index) => {
      parts.push(print());
      if (index !== lastArgIndex) {
        parts.push(", ");
      }
    });
    parts.push(")");
    return parts;
  }

  let anyArgEmptyLine = false;
  const printedArguments = [];
  iterateCallArgumentsPath(path, ({ node: arg }, index) => {
    let argDoc = print();

    if (index === lastArgIndex) {
      // do nothing
    } else if (isNextLineEmpty(arg, options)) {
      anyArgEmptyLine = true;
      argDoc = [argDoc, ",", hardline, hardline];
    } else {
      argDoc = [argDoc, ",", line];
    }

    printedArguments.push(argDoc);
  });

  // Dynamic imports cannot have trailing commas
  const isDynamicImport =
    node.type === "ImportExpression" || node.callee.type === "Import";
  const maybeTrailingComma =
    // Angular does not allow trailing comma
    !options.parser.startsWith("__ng_") &&
    !isDynamicImport &&
    shouldPrintComma(options, "all")
      ? ","
      : "";

  function allArgsBrokenOut() {
    return group(
      ["(", indent([line, ...printedArguments]), maybeTrailingComma, line, ")"],
      { shouldBreak: true },
    );
  }

  if (
    anyArgEmptyLine ||
    (path.parent.type !== "Decorator" && isFunctionCompositionArgs(args))
  ) {
    return allArgsBrokenOut();
  }

  if (shouldExpandFirstArg(args)) {
    const tailArgs = printedArguments.slice(1);
    if (tailArgs.some(willBreak)) {
      return allArgsBrokenOut();
    }
    let firstArg;
    try {
      firstArg = print(getCallArgumentSelector(node, 0), {
        expandFirstArg: true,
      });
    } catch (caught) {
      if (caught instanceof ArgExpansionBailout) {
        return allArgsBrokenOut();
      }
      /* c8 ignore next */
      throw caught;
    }

    if (willBreak(firstArg)) {
      return [
        breakParent,
        conditionalGroup([
          ["(", group(firstArg, { shouldBreak: true }), ", ", ...tailArgs, ")"],
          allArgsBrokenOut(),
        ]),
      ];
    }

    return conditionalGroup([
      ["(", firstArg, ", ", ...tailArgs, ")"],
      ["(", group(firstArg, { shouldBreak: true }), ", ", ...tailArgs, ")"],
      allArgsBrokenOut(),
    ]);
  }

  if (shouldExpandLastArg(args, printedArguments, options)) {
    const headArgs = printedArguments.slice(0, -1);
    if (headArgs.some(willBreak)) {
      return allArgsBrokenOut();
    }
    let lastArg;
    try {
      lastArg = print(getCallArgumentSelector(node, -1), {
        expandLastArg: true,
      });
    } catch (caught) {
      if (caught instanceof ArgExpansionBailout) {
        return allArgsBrokenOut();
      }
      /* c8 ignore next */
      throw caught;
    }

    if (willBreak(lastArg)) {
      return [
        breakParent,
        conditionalGroup([
          ["(", ...headArgs, group(lastArg, { shouldBreak: true }), ")"],
          allArgsBrokenOut(),
        ]),
      ];
    }

    return conditionalGroup([
      ["(", ...headArgs, lastArg, ")"],
      ["(", ...headArgs, group(lastArg, { shouldBreak: true }), ")"],
      allArgsBrokenOut(),
    ]);
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

function couldExpandArg(arg, arrowChainRecursion = false) {
  return (
    (isObjectOrRecordExpression(arg) &&
      (arg.properties.length > 0 || hasComment(arg))) ||
    (isArrayOrTupleExpression(arg) &&
      (arg.elements.length > 0 || hasComment(arg))) ||
    (arg.type === "TSTypeAssertion" && couldExpandArg(arg.expression)) ||
    (isBinaryCastExpression(arg) && couldExpandArg(arg.expression)) ||
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
          couldExpandArg(arg.body, true)) ||
        isObjectOrRecordExpression(arg.body) ||
        isArrayOrTupleExpression(arg.body) ||
        (!arrowChainRecursion &&
          (isCallExpression(arg.body) ||
            arg.body.type === "ConditionalExpression")) ||
        isJsxElement(arg.body))) ||
    arg.type === "DoExpression" ||
    arg.type === "ModuleExpression"
  );
}

function shouldExpandLastArg(args, argDocs, options) {
  const lastArg = args.at(-1);

  if (args.length === 1) {
    const lastArgDoc = argDocs.at(-1);
    if (lastArgDoc.label?.embed && lastArgDoc.label?.hug !== false) {
      return true;
    }
  }

  const penultimateArg = args.at(-2);
  return (
    !hasComment(lastArg, CommentCheckFlags.Leading) &&
    !hasComment(lastArg, CommentCheckFlags.Trailing) &&
    couldExpandArg(lastArg) &&
    // If the last two arguments are of the same type,
    // disable last element expansion.
    (!penultimateArg || penultimateArg.type !== lastArg.type) &&
    // useMemo(() => func(), [foo, bar, baz])
    (args.length !== 2 ||
      penultimateArg.type !== "ArrowFunctionExpression" ||
      !isArrayOrTupleExpression(lastArg)) &&
    !(args.length > 1 && isConciselyPrintedArray(lastArg, options))
  );
}

function shouldExpandFirstArg(args) {
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
    isHopefullyShortCallArgument(secondArg) &&
    !couldExpandArg(secondArg)
  );
}

// A hack to fix most manifestations of
// https://github.com/prettier/prettier/issues/2456
// https://github.com/prettier/prettier/issues/5172
// https://github.com/prettier/prettier/issues/12892
// A proper (printWidth-aware) fix for those would require a complex change in the doc printer.
function isHopefullyShortCallArgument(node) {
  if (node.type === "ParenthesizedExpression") {
    return isHopefullyShortCallArgument(node.expression);
  }

  if (isBinaryCastExpression(node) || node.type === "TypeCastExpression") {
    let { typeAnnotation } = node;
    if (typeAnnotation.type === "TypeAnnotation") {
      typeAnnotation = typeAnnotation.typeAnnotation;
    }

    if (typeAnnotation.type === "TSArrayType") {
      typeAnnotation = typeAnnotation.elementType;
      if (typeAnnotation.type === "TSArrayType") {
        typeAnnotation = typeAnnotation.elementType;
      }
    }
    if (
      (typeAnnotation.type === "GenericTypeAnnotation" ||
        typeAnnotation.type === "TSTypeReference") &&
      typeAnnotation.typeParameters?.params.length === 1
    ) {
      typeAnnotation = typeAnnotation.typeParameters.params[0];
    }
    return (
      isSimpleType(typeAnnotation) && isSimpleCallArgument(node.expression, 1)
    );
  }

  if (isCallLikeExpression(node) && getCallArguments(node).length > 1) {
    return false;
  }

  if (isBinaryish(node)) {
    return (
      isSimpleCallArgument(node.left, 1) && isSimpleCallArgument(node.right, 1)
    );
  }

  return isRegExpLiteral(node) || isSimpleCallArgument(node);
}

/**
 * Checks if the arguments of a function are a call to a React Hook with a dependencies array.
 */
function isReactHookCallWithDepsArray(args) {
  if (args.length === 2) {
    /**
     * useEffect(() => {
     *   // do something
     * }, [dep1, dep2, dep2])
     */
    return isValidHookCallbackAndDepsFormat(args, /* baseIndex */ 0);
  }
  if (args.length === 3) {
    /**
     * useImperativeHandle(ref, () => {
     *   // do something
     * }, [dep1, dep2, dep2]);
     */
    return (
      args[0].type === "Identifier" &&
      isValidHookCallbackAndDepsFormat(args, /* baseIndex */ 1)
    );
  }
  return false;
}

function isValidHookCallbackAndDepsFormat(args, baseIndex) {
  const maybeArrowFunction = args[baseIndex];
  const maybeDepsArray = args[baseIndex + 1];
  return (
    maybeArrowFunction.type === "ArrowFunctionExpression" &&
    getFunctionParameters(maybeArrowFunction).length === 0 &&
    maybeArrowFunction.body.type === "BlockStatement" &&
    maybeDepsArray.type === "ArrayExpression" &&
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

export default printCallArguments;
