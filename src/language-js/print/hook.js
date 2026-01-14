import { group } from "../../document/index.js";
import {
  printFunctionParameters,
  shouldGroupFunctionParameters,
} from "./function-parameters.js";
import { printDeclareToken } from "./miscellaneous.js";

/**
 * @import AstPath from "../../common/ast-path.js"
 * @import {Doc} from "../../document/index.js"
 */

/*
- "DeclareHook"
*/
function printDeclareHook(path, options, print) {
  const { node } = path;

  const parts = [printDeclareToken(path), "hook"];
  if (node.id) {
    parts.push(" ", print("id"));
  }

  if (options.semi) {
    parts.push(";");
  }

  return parts;
}

/*
`HookTypeAnnotation` is ambiguous:
- `declare hook useFoo(a: B): void;`
- `var A: hook (a: B) => void;`
*/
function isDeclareHookTypeAnnotation(path) {
  const { node } = path;
  return (
    node.type === "HookTypeAnnotation" &&
    path.getParentNode(2)?.type === "DeclareHook"
  );
}

/*
- `HookTypeAnnotation` (Flow)
*/
function printHookTypeAnnotation(path, options, print) {
  const { node } = path;

  const parametersDoc = printFunctionParameters(
    path,
    options,
    print,
    /* shouldExpandArgument */ false,
    /* shouldPrintTypeParameters */ true,
  );

  const returnTypeDoc = [
    isDeclareHookTypeAnnotation(path) ? ": " : " => ",
    print("returnType"),
  ];

  return group([
    isDeclareHookTypeAnnotation(path) ? "" : "hook ",
    shouldGroupFunctionParameters(node, returnTypeDoc)
      ? group(parametersDoc)
      : parametersDoc,
    returnTypeDoc,
  ]);
}

export { printDeclareHook, printHookTypeAnnotation };
