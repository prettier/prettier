import { group } from "../../document/builders.js";
import { printReturnType } from "./function.js";
import {
  printFunctionParameters,
  shouldGroupFunctionParameters,
} from "./function-parameters.js";
import { printDeclareToken } from "./misc.js";

/**
 * @typedef {import("../../common/ast-path.js").default} AstPath
 * @typedef {import("../../document/builders.js").Doc} Doc
 */

/*
- "HookDeclaration"
*/
function printHook(path, options, print) {
  const { node } = path;

  /** @type {Array<Doc>} */
  const parts = ["hook"];
  if (node.id) {
    parts.push(" ", print("id"));
  }

  const parametersDoc = printFunctionParameters(
    path,
    print,
    options,
    false,
    true,
  );
  const returnTypeDoc = printReturnType(path, print);
  const shouldGroupParameters = shouldGroupFunctionParameters(
    node,
    returnTypeDoc,
  );

  parts.push(
    group([
      shouldGroupParameters ? group(parametersDoc) : parametersDoc,
      returnTypeDoc,
    ]),
    node.body ? " " : "",
    print("body"),
  );

  return parts;
}

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
- "HookTypeAnnotation"
*/
function printHookTypeAnnotation(path, options, print) {
  const { node } = path;
  const parts = [];

  parts.push(isDeclareHookTypeAnnotation(path) ? "" : "hook ");

  let parametersDoc = printFunctionParameters(
    path,
    print,
    options,
    /* expandArg */ false,
    /* printTypeParams */ true,
  );

  const returnTypeDoc = [];
  returnTypeDoc.push(
    isDeclareHookTypeAnnotation(path) ? ": " : " => ",
    print("returnType"),
  );

  if (shouldGroupFunctionParameters(node, returnTypeDoc)) {
    parametersDoc = group(parametersDoc);
  }

  parts.push(parametersDoc, returnTypeDoc);

  return group(parts);
}

export { printDeclareHook, printHook, printHookTypeAnnotation };
