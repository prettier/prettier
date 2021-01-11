"use strict";

const {
  builders: { join, group },
} = require("../../document");
const pathNeedsParens = require("../needs-parens");
const {
  getCallArguments,
  hasFlowAnnotationComment,
  isCallOrOptionalCallExpression,
  isMemberish,
  isTemplateOnItsOwnLine,
  isTestCall,
  iterateCallArgumentsPath,
} = require("../utils");
const printMemberChain = require("./member-chain");
const printCallArguments = require("./call-arguments");
const { printOptionalToken, printFunctionTypeParameters } = require("./misc");

function printCallExpression(path, options, print) {
  const n = path.getValue();
  const isNew = n.type === "NewExpression";
  const isDynamicImport = n.type === "ImportExpression";

  const optional = printOptionalToken(path);
  const args = getCallArguments(n);
  if (
    // Dangling comments not handled, all these special cases should has argument #9668
    args.length > 0 &&
    // We want to keep CommonJS- and AMD-style require calls, and AMD-style
    // define calls, as a unit.
    // e.g. `define(["some/lib", (lib) => {`
    ((!isDynamicImport &&
      !isNew &&
      n.callee.type === "Identifier" &&
      (n.callee.name === "require" || n.callee.name === "define")) ||
      // Template literals as single arguments
      (args.length === 1 &&
        isTemplateOnItsOwnLine(args[0], options.originalText)) ||
      // Keep test declarations on a single line
      // e.g. `it('long name', () => {`
      (!isNew && isTestCall(n, path.getParentNode())))
  ) {
    const printed = [];
    iterateCallArgumentsPath(path, (argPath) => {
      printed.push(print(argPath));
    });
    return [
      isNew ? "new " : "",
      path.call(print, "callee"),
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
    n.callee &&
    n.callee.type === "Identifier" &&
    hasFlowAnnotationComment(n.callee.trailingComments);
  if (isIdentifierWithFlowAnnotation) {
    n.callee.trailingComments[0].printed = true;
  }

  // We detect calls on member lookups and possibly print them in a
  // special chain format. See `printMemberChain` for more info.
  if (
    !isDynamicImport &&
    !isNew &&
    isMemberish(n.callee) &&
    !path.call((path) => pathNeedsParens(path, options), "callee")
  ) {
    return printMemberChain(path, options, print);
  }

  const contents = [
    isNew ? "new " : "",
    isDynamicImport ? "import" : path.call(print, "callee"),
    optional,
    isIdentifierWithFlowAnnotation
      ? `/*:: ${n.callee.trailingComments[0].value.slice(2).trim()} */`
      : "",
    printFunctionTypeParameters(path, options, print),
    printCallArguments(path, options, print),
  ];

  // We group here when the callee is itself a call expression.
  // See `isLongCurriedCallExpression` for more info.
  if (isDynamicImport || isCallOrOptionalCallExpression(n.callee)) {
    return group(contents);
  }

  return contents;
}

module.exports = { printCallExpression };
