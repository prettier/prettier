"use strict";

const {
  builders: { join, group },
} = require("../../document");
const pathNeedsParens = require("../needs-parens");
const {
  getCallArguments,
  hasFlowAnnotationComment,
  isCallExpression,
  isMemberish,
  isStringLiteral,
  isTemplateOnItsOwnLine,
  isTestCall,
  iterateCallArgumentsPath,
} = require("../utils");
const printMemberChain = require("./member-chain");
const printCallArguments = require("./call-arguments");
const { printOptionalToken, printFunctionTypeParameters } = require("./misc");

function printCallExpression(path, options, print) {
  const node = path.getValue();
  const parentNode = path.getParentNode();
  const isNew = node.type === "NewExpression";
  const isDynamicImport = node.type === "ImportExpression";

  const optional = printOptionalToken(path);
  const args = getCallArguments(node);
  if (
    // Dangling comments are not handled, all these special cases should have arguments #9668
    args.length > 0 &&
    // We want to keep CommonJS- and AMD-style require calls, and AMD-style
    // define calls, as a unit.
    // e.g. `define(["some/lib"], (lib) => {`
    ((!isDynamicImport && !isNew && isCommonsJsOrAmdCall(node, parentNode)) ||
      // Template literals as single arguments
      (args.length === 1 &&
        isTemplateOnItsOwnLine(args[0], options.originalText)) ||
      // Keep test declarations on a single line
      // e.g. `it('long name', () => {`
      (!isNew && isTestCall(node, parentNode)))
  ) {
    const printed = [];
    iterateCallArgumentsPath(path, () => {
      printed.push(print());
    });
    return [
      isNew ? "new " : "",
      print("callee"),
      optional,
      printFunctionTypeParameters(path, options, print),
      "(",
      join(", ", printed),
      ")",
    ];
  }

  // Inline Flow annotation comments following Identifiers in Call nodes need to
  // stay with the Identifier. For example:
  //
  // foo /*:: <SomeGeneric> */(bar);
  //
  // Here, we ensure that such comments stay between the Identifier and the Callee.
  const isIdentifierWithFlowAnnotation =
    (options.parser === "babel" || options.parser === "babel-flow") &&
    node.callee &&
    node.callee.type === "Identifier" &&
    hasFlowAnnotationComment(node.callee.trailingComments);
  if (isIdentifierWithFlowAnnotation) {
    node.callee.trailingComments[0].printed = true;
  }

  // We detect calls on member lookups and possibly print them in a
  // special chain format. See `printMemberChain` for more info.
  if (
    !isDynamicImport &&
    !isNew &&
    isMemberish(node.callee) &&
    !path.call((path) => pathNeedsParens(path, options), "callee")
  ) {
    return printMemberChain(path, options, print);
  }

  const contents = [
    isNew ? "new " : "",
    isDynamicImport ? "import" : print("callee"),
    optional,
    isIdentifierWithFlowAnnotation
      ? `/*:: ${node.callee.trailingComments[0].value.slice(2).trim()} */`
      : "",
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

function isCommonsJsOrAmdCall(node, parentNode) {
  if (node.callee.type !== "Identifier") {
    return false;
  }

  if (node.callee.name === "require") {
    return true;
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

module.exports = { printCallExpression };
