import { group, join } from "../../document/builders.js";
import pathNeedsParens from "../needs-parens.js";
import {
  getCallArguments,
  hasComment,
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
  const { node } = path;
  const isNewExpression = node.type === "NewExpression";

  const optional = printOptionalToken(path);
  const args = getCallArguments(node);

  const isTemplateLiteralSingleArg =
    args.length === 1 && isTemplateOnItsOwnLine(args[0], options.originalText);

  if (
    isTemplateLiteralSingleArg ||
    // Don't break simple `import()` with long module name
    isSimpleModuleImport(path) ||
    // Dangling comments are not handled, all these special cases should have arguments #9668
    // We want to keep CommonJS- and AMD-style require calls, and AMD-style
    // define calls, as a unit.
    // e.g. `define(["some/lib"], (lib) => {`
    isCommonsJsOrAmdModuleDefinition(path) ||
    // Keep test declarations on a single line
    // e.g. `it('long name', () => {`
    isTestCall(node, path.parent)
  ) {
    const printed = [];
    iterateCallArgumentsPath(path, () => {
      printed.push(print());
    });
    if (!(isTemplateLiteralSingleArg && printed[0].label?.embed)) {
      return [
        isNewExpression ? "new " : "",
        printCallee(path, print),
        optional,
        printFunctionTypeParameters(path, options, print),
        "(",
        join(", ", printed),
        ")",
      ];
    }
  }

  const isDynamicImport =
    node.type === "ImportExpression" || node.type === "TSImportType";

  // We detect calls on member lookups and possibly print them in a
  // special chain format. See `printMemberChain` for more info.
  if (
    !isDynamicImport &&
    !isNewExpression &&
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
    isNewExpression ? "new " : "",
    printCallee(path, print),
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

function printCallee(path, print) {
  const { node } = path;

  if (node.type === "ImportExpression" || node.type === "TSImportType") {
    return `import${node.phase ? `.${node.phase}` : ""}`;
  }

  return print("callee");
}

function isSimpleModuleImport(path) {
  const { node } = path;

  if (
    !(
      // `import("foo")`
      (
        node.type === "ImportExpression" ||
        // `type foo = import("foo")`
        node.type === "TSImportType" ||
        // `require("foo")`
        (node.type === "CallExpression" &&
          !node.optional &&
          node.callee.type === "Identifier" &&
          node.callee.name === "require")
      )
    )
  ) {
    return false;
  }

  const args = getCallArguments(node);

  if (args.length !== 1 || hasComment(args[0])) {
    return false;
  }

  let source = args[0];

  // TODO: remove this once https://github.com/typescript-eslint/typescript-eslint/issues/11583 get fixed
  if (node.type === "TSImportType" && source.type === "TSLiteralType") {
    source = source.literal;
  }

  return isStringLiteral(source);
}

function isCommonsJsOrAmdModuleDefinition(path) {
  const { node } = path;

  if (node.type !== "CallExpression" || node.optional) {
    return false;
  }

  if (node.callee.type !== "Identifier") {
    return false;
  }

  const args = getCallArguments(node);

  // AMD module
  if (node.callee.name === "require") {
    return (args.length === 1 && isStringLiteral(args[0])) || args.length > 1;
  }

  // CommonJS module
  if (
    node.callee.name === "define" &&
    path.parent.type === "ExpressionStatement"
  ) {
    return (
      args.length === 1 ||
      (args.length === 2 && args[0].type === "ArrayExpression") ||
      (args.length === 3 &&
        isStringLiteral(args[0]) &&
        args[1].type === "ArrayExpression")
    );
  }

  return false;
}

export { printCallExpression };
