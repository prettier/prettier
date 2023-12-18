import { group, indent, label, softline } from "../../document/builders.js";
import {
  getCallArguments,
  isCallExpression,
  isMemberExpression,
  isNumericLiteral,
} from "../utils/index.js";
import { printOptionalToken } from "./misc.js";

const isCallExpressionWithArguments = (node) => {
  if (node.type === "ChainExpression" || node.type === "TSNonNullExpression") {
    node = node.expression;
  }
  return isCallExpression(node) && getCallArguments(node).length > 0;
};

function printMemberExpression(path, options, print) {
  const objectDoc = print("object");
  const lookupDoc = printMemberLookup(path, options, print);
  const { node } = path;
  const firstNonMemberParent = path.findAncestor(
    (node) =>
      !(isMemberExpression(node) || node.type === "TSNonNullExpression"),
  );
  const firstNonChainElementWrapperParent = path.findAncestor(
    (node) =>
      !(node.type === "ChainExpression" || node.type === "TSNonNullExpression"),
  );

  const shouldInline =
    (firstNonMemberParent &&
      (firstNonMemberParent.type === "NewExpression" ||
        firstNonMemberParent.type === "BindExpression" ||
        (firstNonMemberParent.type === "AssignmentExpression" &&
          firstNonMemberParent.left.type !== "Identifier"))) ||
    node.computed ||
    (node.object.type === "Identifier" &&
      node.property.type === "Identifier" &&
      !isMemberExpression(firstNonChainElementWrapperParent)) ||
    ((firstNonChainElementWrapperParent.type === "AssignmentExpression" ||
      firstNonChainElementWrapperParent.type === "VariableDeclarator") &&
      (isCallExpressionWithArguments(node.object) ||
        objectDoc.label?.memberChain));

  return label(objectDoc.label, [
    objectDoc,
    shouldInline ? lookupDoc : group(indent([softline, lookupDoc])),
  ]);
}

function printMemberLookup(path, options, print) {
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

export { printMemberExpression, printMemberLookup };
