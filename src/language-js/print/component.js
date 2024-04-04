import {
  group,
  hardline,
  ifBreak,
  indent,
  line,
  softline,
} from "../../document/builders.js";
import { printDanglingComments } from "../../main/comments/print.js";
import getNextNonSpaceNonCommentCharacter from "../../utils/get-next-non-space-non-comment-character.js";
import { locEnd } from "../loc.js";
import { isNextLineEmpty, shouldPrintComma } from "../utils/index.js";
import { printDeclareToken } from "./misc.js";

/**
 * @typedef {import("../../common/ast-path.js").default} AstPath
 * @typedef {import("../../document/builders.js").Doc} Doc
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

  const parametersDoc = printComponentParameters(path, print, options);
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

function printComponentParameters(path, print, options) {
  const { node: componentNode } = path;
  let parameters = componentNode.params;
  if (componentNode.rest) {
    parameters = [...parameters, componentNode.rest];
  }

  if (parameters.length === 0) {
    return [
      "(",
      printDanglingComments(path, options, {
        filter: (comment) =>
          getNextNonSpaceNonCommentCharacter(
            options.originalText,
            locEnd(comment),
          ) === ")",
      }),
      ")",
    ];
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

function iterateComponentParametersPath(path, iteratee) {
  const { node } = path;
  let index = 0;
  const callback = (childPath) => iteratee(childPath, index++);
  path.each(callback, "params");
  if (node.rest) {
    path.call(callback, "rest");
  }
}

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
