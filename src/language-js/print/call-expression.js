import { group, join } from "../../document/index.js";
import needsParentheses from "../parentheses/needs-parentheses.js";
import {
  getCallArguments,
  hasComment,
  isCallExpression,
  isMemberish,
  isNodeMatches,
  isStringLiteral,
  isTemplateOnItsOwnLine,
  isTestCall,
  iterateCallArgumentsPath,
} from "../utilities/index.js";
import printCallArguments from "./call-arguments.js";
import printMemberChain from "./member-chain.js";
import { printOptionalToken } from "./miscellaneous.js";

/*
- `NewExpression`
- `ImportExpression`
- `OptionalCallExpression`
- `CallExpression`
- `TSImportType` (TypeScript)
- `TSExternalModuleReference` (TypeScript)
*/
function printCallExpression(path, options, print) {
  const { node } = path;
  const isNewExpression = node.type === "NewExpression";

  const optional = printOptionalToken(path);
  const args = getCallArguments(node);
  // `TSImportType.typeArguments` is after `qualifier`, not before the "arguments"
  const typeArgumentsDoc =
    node.type !== "TSImportType" && node.typeArguments
      ? print("typeArguments")
      : "";

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
        typeArgumentsDoc,
        "(",
        join(", ", printed),
        ")",
      ];
    }
  }

  const isDynamicImportLike =
    node.type === "ImportExpression" ||
    node.type === "TSImportType" ||
    node.type === "TSExternalModuleReference";

  // We detect calls on member lookups and possibly print them in a
  // special chain format. See `printMemberChain` for more info.
  if (
    !isDynamicImportLike &&
    !isNewExpression &&
    isMemberish(node.callee) &&
    !path.call(
      () => needsParentheses(path, options),
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
    typeArgumentsDoc,
    printCallArguments(path, options, print),
  ];

  // We group here when the callee is itself a call expression.
  // See `isLongCurriedCallExpression` for more info.
  if (isDynamicImportLike || isCallExpression(node.callee)) {
    return group(contents);
  }

  return contents;
}

function printCallee(path, print) {
  const { node } = path;

  if (node.type === "ImportExpression") {
    return `import${node.phase ? `.${node.phase}` : ""}`;
  }

  if (node.type === "TSImportType") {
    return "import";
  }

  if (node.type === "TSExternalModuleReference") {
    return "require";
  }

  return print("callee");
}

const moduleImportCallees = [
  "require",
  "require.resolve",
  "require.resolve.paths",
  "import.meta.resolve",
];
function isSimpleModuleImport(path) {
  const { node } = path;

  if (
    !(
      // `import("foo")`
      (
        node.type === "ImportExpression" ||
        // `type foo = import("foo")`
        node.type === "TSImportType" ||
        // `import type A = require("foo")`
        node.type === "TSExternalModuleReference" ||
        // `require("foo")`
        // `require.resolve("foo")`
        // `require.resolve.paths("foo")`
        // `import.meta.resolve("foo")`
        (node.type === "CallExpression" &&
          !node.optional &&
          isNodeMatches(node.callee, moduleImportCallees))
      )
    )
  ) {
    return false;
  }

  const args = getCallArguments(node);

  return args.length === 1 && isStringLiteral(args[0]) && !hasComment(args[0]);
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
    return (
      ((args.length === 1 && isStringLiteral(args[0])) || args.length > 1) &&
      !hasComment(args[0])
    );
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
