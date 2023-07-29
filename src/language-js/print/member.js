import { softline, group, indent, label } from "../../document/builders.js";
import {
  isNumericLiteral,
  isMemberExpression,
  isCallExpression,
} from "../utils/index.js";
import { printOptionalToken } from "./misc.js";

/**
 * @typedef {import("../../common/ast-path.js").default} AstPath
 * @typedef {import("../../document/builders.js").Doc} Doc
 */

function printMemberExpression(path, options, print) {
  const objectDoc = print("object");
  const lookupDoc = printMemberLookup(path, options, print, objectDoc);

  return label(objectDoc.label, [objectDoc, lookupDoc]);
}

/**
 * @param {AstPath} path
 * @param {*} options
 * @param {*} print
 * @param {Doc} [objectDoc]
 * @returns {Doc}
 */
function printMemberLookup(path, options, print, objectDoc) {
  const doc = lookupDoc();
  if (shouldInlineMember(path, objectDoc)) {
    return doc;
  }
  return group(indent([softline, doc]));

  /**
   * @returns {Doc}
   */
  function lookupDoc() {
    const property = print("property");
    const { node } = path;
    const optional = printOptionalToken(path);

    if (!node.computed) {
      return [optional, ".", property];
    }

    if (!node.property || isNumericLiteral(node.property)) {
      return [optional, "[", property, "]"];
    }

    return group([optional, "[", indent([softline, property]), softline, "]"]);
  }
}

/**
 * @param {AstPath} path
 * @param {*} [objectDoc]
 * @returns {boolean}
 */
function shouldInlineMember(path, objectDoc) {
  const { node, parent } = path;
  const firstNonMemberParent = path.findAncestor(
    (node) =>
      !(isMemberExpression(node) || node.type === "TSNonNullExpression"),
  );

  return (
    (firstNonMemberParent &&
      (firstNonMemberParent.type === "NewExpression" ||
        firstNonMemberParent.type === "BindExpression" ||
        (firstNonMemberParent.type === "AssignmentExpression" &&
          firstNonMemberParent.left.type !== "Identifier"))) ||
    node.computed ||
    (node.object.type === "Identifier" &&
      node.property.type === "Identifier" &&
      !isMemberExpression(parent)) ||
    ((parent.type === "AssignmentExpression" ||
      parent.type === "VariableDeclarator") &&
      ((isCallExpression(node.object) && node.object.arguments.length > 0) ||
        (node.object.type === "TSNonNullExpression" &&
          isCallExpression(node.object.expression) &&
          node.object.expression.arguments.length > 0) ||
        objectDoc?.label?.memberChain))
  );
}

export { printMemberExpression, printMemberLookup };
