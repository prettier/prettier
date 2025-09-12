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
import { printTypeParameters } from "./type-parameters.js";

function printCallExpression(path, options, print) {
  const { node } = path;
  const isNew = node.type === "NewExpression";
  const isDynamicImport = node.type === "ImportExpression";
  const isTSImport = node.type === "TSImportType";

  const optional = printOptionalToken(path);
  const args = getCallArguments(node);

  const isTemplateLiteralSingleArg =
    args.length === 1 && isTemplateOnItsOwnLine(args[0], options.originalText);

  if (
    isTemplateLiteralSingleArg ||
    // Dangling comments are not handled, all these special cases should have arguments #9668
    // We want to keep AMD-style define calls as a unit.
    // e.g. `define(["some/lib"], (lib) => {`
    isCommonsJsOrAmdModuleDefinition(path) ||
    // Don't break simple import with long module name
    isImportDefinition(path) ||
    // Keep test declarations on a single line
    // e.g. `it('long name', () => {`
    isTestCall(node, path.parent)
  ) {
    const printed = [];
    iterateCallArgumentsPath(path, () => {
      printed.push(print());
    });

    if (!(isTemplateLiteralSingleArg && printed[0].label?.embed)) {
      if (isTSImport) {
        return [
          "import",
          group(["(", printed, ")"]),
          !node.qualifier ? "" : [".", print("qualifier")],
          printTypeParameters(
            path,
            options,
            print,
            node.typeArguments ? "typeArguments" : "typeParameters",
          ),
        ];
      }

      return [
        isNew ? "new " : "",
        printCallee(path, print),
        optional,
        printFunctionTypeParameters(path, options, print),
        "(",
        join(", ", printed),
        ")",
      ];
    }
  }

  if (isTSImport) {
    return [
      "import",
      printCallArguments(path, options, print),
      !node.qualifier ? "" : [".", print("qualifier")],
      printTypeParameters(
        path,
        options,
        print,
        node.typeArguments ? "typeArguments" : "typeParameters",
      ),
    ];
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

  if (node.type === "ImportExpression") {
    return `import${node.phase ? `.${node.phase}` : ""}`;
  }

  return print("callee");
}

function isImportDefinition(path) {
  const { node } = path;

  const args = getCallArguments(node);

  if (
    (node.type === "ImportExpression" || node.type === "TSImportType") &&
    args.length === 1 &&
    !hasComment(args[0])
  ) {
    let source = args[0];

    // TODO: remove this once https://github.com/typescript-eslint/typescript-eslint/issues/11583 get fixed
    if (source.type === "TSLiteralType") {
      source = source.literal;
    }

    if (isStringLiteral(source)) {
      return true;
    }
  }

  return false;
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
