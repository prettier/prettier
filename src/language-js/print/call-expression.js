import { group, join } from "../../document/builders.js";
import pathNeedsParens from "../needs-parens.js";
import {
  getCallArguments,
  isCallExpression,
  isMemberish,
  isStringLiteral,
  isTemplateOnItsOwnLine,
  isTestCall,
  iterateCallArgumentsPath,
} from "../utils/index.js";
import printCallArguments from "./call-arguments.js";
import printMemberChain from "./member-chain.js";
import { printFunctionTypeParameters, printOptionalToken } from "./misc.js";

function printCallExpression(path, options, print) {
  const { node, parent } = path;
  const isNew = node.type === "NewExpression";
  const isDynamicImport = node.type === "ImportExpression";

  const optional = printOptionalToken(path);
  const args = getCallArguments(node);

  const isTemplateLiteralSingleArg =
    args.length === 1 && isTemplateOnItsOwnLine(args[0], options.originalText);

  if (
    isTemplateLiteralSingleArg ||
    // Dangling comments are not handled, all these special cases should have arguments #9668
    (args.length > 0 &&
      !isNew &&
      !isDynamicImport &&
      // We want to keep CommonJS- and AMD-style require calls, and AMD-style
      // define calls, as a unit.
      // e.g. `define(["some/lib"], (lib) => {`
      (isCommonsJsOrAmdCall(node, parent) ||
        // Keep test declarations on a single line
        // e.g. `it('long name', () => {`
        isTestCall(node, parent)))
  ) {
    const printed = [];
    iterateCallArgumentsPath(path, () => {
      printed.push(print());
    });
    if (!(isTemplateLiteralSingleArg && printed[0].label?.embed)) {
      return [
        isNew ? "new " : "",
        isDynamicImport ? printDynamicImportCallee(node) : print("callee"),
        optional,
        printFunctionTypeParameters(path, options, print),
        "(",
        join(", ", printed),
        ")",
      ];
    }
  }

  // We detect calls on member lookups and possibly print them in a
  // special chain format. See `printMemberChain` for more info.
  if (
    !isDynamicImport &&
    !isNew &&
    isMemberish(node.callee) &&
    !path.call(
      (path) => pathNeedsParens(path, options),
      "callee",
      ...(node.callee.type === "ChainExpression" ? ["expression"] : []),
    )
  ) {
    return printMemberChain(path, options, print);
  }

  const contents = [
    isNew ? "new " : "",
    isDynamicImport ? printDynamicImportCallee(node) : print("callee"),
    optional,
    printFunctionTypeParameters(path, options, print),
    printCallArguments(path, options, print),
  ];

  // We group here when the callee is itself a call expression.
  // See `isLongCurriedCallExpression` for more info.
  if (isDynamicImport || isCallExpression(node.callee)) {
    return group(contents);
  }

  return contents;
}

function printDynamicImportCallee(node) {
  if (!node.phase) {
    return "import";
  }
  return `import.${node.phase}`;
}

function isCommonsJsOrAmdCall(node, parentNode) {
  if (node.callee.type !== "Identifier") {
    return false;
  }

  if (node.callee.name === "require") {
    const args = getCallArguments(node);
    return (args.length === 1 && isStringLiteral(args[0])) || args.length > 1;
  }

  if (node.callee.name === "define") {
    const args = getCallArguments(node);
    return (
      parentNode.type === "ExpressionStatement" &&
      (args.length === 1 ||
        (args.length === 2 && args[0].type === "ArrayExpression") ||
        (args.length === 3 &&
          isStringLiteral(args[0]) &&
          args[1].type === "ArrayExpression"))
    );
  }

  return false;
}

export { printCallExpression };
