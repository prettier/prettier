import {
  group,
  hardline,
  ifBreak,
  indent,
  line,
  softline,
} from "../../document/index.js";
import {
  getComponentParameters,
  isNextLineEmpty,
  iterateComponentParametersPath,
  shouldPrintComma,
} from "../utilities/index.js";
import {
  printDanglingCommentsInList,
  printDeclareToken,
} from "./miscellaneous.js";

/**
 * @import AstPath from "../../common/ast-path.js"
 * @import {Doc} from "../../document/index.js"
 */

/*
- "ComponentDeclaration"
- "DeclareComponent"
- "ComponentTypeAnnotation"
*/
function printComponent(path, options, print) {
  const { node } = path;

  const parts = [printDeclareToken(path), "component"];
  if (node.id) {
    parts.push(" ", print("id"));
  }

  parts.push(print("typeParameters"));

  const parametersDoc = printComponentParameters(path, options, print);
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

function printComponentParameters(path, options, print) {
  const { node: componentNode } = path;
  const parameters = getComponentParameters(componentNode);

  if (parameters.length === 0) {
    return ["(", printDanglingCommentsInList(path, options), ")"];
  }

  const printed = [];
  iterateComponentParametersPath(path, (parameterPath, index) => {
    const isLastParameter = index === parameters.length - 1;
    if (isLastParameter && componentNode.rest) {
      printed.push("...");
    }
    printed.push(print());
    if (isLastParameter) {
      return;
    }
    printed.push(",");
    if (isNextLineEmpty(parameters[index], options)) {
      printed.push(hardline, hardline);
    } else {
      printed.push(line);
    }
  });

  return [
    "(",
    indent([softline, ...printed]),
    ifBreak(
      shouldPrintComma(options, "all") &&
        !hasRestParameter(componentNode, parameters)
        ? ","
        : "",
    ),
    softline,
    ")",
  ];
}

function hasRestParameter(componentNode, parameters) {
  return componentNode.rest || parameters.at(-1)?.type === "RestElement";
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
