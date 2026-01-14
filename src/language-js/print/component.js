import { group } from "../../document/index.js";
import { printFunctionParameters } from "./function-parameters.js";
import { printDeclareToken } from "./miscellaneous.js";

/**
 * @import AstPath from "../../common/ast-path.js"
 * @import {Doc} from "../../document/index.js"
 */

/*
- `ComponentDeclaration` (Flow)
- `DeclareComponent` (Flow)
- `ComponentTypeAnnotation` (Flow)
*/
function printComponent(path, options, print) {
  const { node } = path;

  const parts = [printDeclareToken(path), "component"];
  if (node.id) {
    parts.push(" ", print("id"));
  }

  parts.push(print("typeParameters"));

  const parametersDoc = printFunctionParameters(path, options, print);
  if (node.rendersType) {
    parts.push(group([parametersDoc, " ", print("rendersType")]));
  } else {
    parts.push(group([parametersDoc]));
  }

  if (node.body) {
    parts.push(" ", print("body"));
  }

  if (options.semi && node.type === "DeclareComponent") {
    parts.push(";");
  }

  return parts;
}

/*
- `ComponentParameter` (Flow)
*/
function printComponentParameter(path, options, print) {
  const { node } = path;
  if (node.shorthand) {
    return print("local");
  }

  return [print("name"), " as ", print("local")];
}

function printComponentTypeParameter(path, options, print) {
  const { node } = path;

  const printed = [];
  if (node.name) {
    printed.push(print("name"), node.optional ? "?: " : ": ");
  }

  printed.push(print("typeAnnotation"));

  return printed;
}

export { printComponent, printComponentParameter, printComponentTypeParameter };
