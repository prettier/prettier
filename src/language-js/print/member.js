import {
  group,
  hardline,
  indent,
  label,
  lineSuffixBoundary,
  softline,
} from "../../document/index.js";
import hasNewline from "../../utilities/has-newline.js";
import { locEnd, locStart } from "../location/index.js";
import { getCallArguments } from "../utilities/call-arguments.js";
import { CommentCheckFlags, hasComment } from "../utilities/comments.js";
import {
  isCallExpression,
  isChainElementWrapper,
  isMemberExpression,
  isNonNullExpression,
  isNumericLiteral,
} from "../utilities/node-types.js";
import { stripChainElementWrappers } from "../utilities/strip-chain-element-wrappers.js";
import { printComment } from "./comment.js";
import { printOptionalToken } from "./miscellaneous.js";

const isCallExpressionWithArguments = (node) =>
  isCallExpression(node) && getCallArguments(node).length > 0;

function shouldInlineNewExpressionCallee(path) {
  let { node: child, ancestors } = path;
  for (const ancestor of ancestors) {
    if (!(
      (isMemberExpression(ancestor) && ancestor.object === child) ||
      (isNonNullExpression(ancestor) && ancestor.expression === child)
    )) {
      return ancestor.type === "NewExpression" && ancestor.callee === child;
    }

    child = ancestor;
  }

  return false;
}

function printMemberExpression(path, options, print) {
  const objectDoc = print("object");
  const lookupDoc = printMemberLookup(path, options, print);
  const { node } = path;
  const firstNonMemberParent = path.findAncestor(
    (node) => !(isMemberExpression(node) || isNonNullExpression(node)),
  );
  const firstNonChainElementWrapperParent = path.findAncestor(
    (node) => !isChainElementWrapper(node),
  );

  const shouldInline =
    firstNonMemberParent.type === "BindExpression" ||
    (firstNonMemberParent.type === "AssignmentExpression" &&
      firstNonMemberParent.left.type !== "Identifier") ||
    shouldInlineNewExpressionCallee(path) ||
    node.computed ||
    (node.object.type === "Identifier" &&
      node.property.type === "Identifier" &&
      !isMemberExpression(firstNonChainElementWrapperParent)) ||
    ((firstNonChainElementWrapperParent.type === "AssignmentExpression" ||
      firstNonChainElementWrapperParent.type === "VariableDeclarator") &&
      (isCallExpressionWithArguments(stripChainElementWrappers(node.object)) ||
        objectDoc.label?.memberChain));

  // Own-line comments between the object and `.property` are attached to the
  // member expression, print them before `.property` instead of before the expression
  const commentsDoc = [];
  if (!node.computed && hasComment(node, CommentCheckFlags.Leading)) {
    const printedComments = options[Symbol.for("printedComments")];
    path.each(({ node: comment }) => {
      if (
        comment.leading &&
        locStart(comment) > locEnd(node.object) &&
        hasNewline(options.originalText, locStart(comment), { backwards: true })
      ) {
        printedComments.add(comment);
        commentsDoc.push(printComment(path, options), hardline);
      }
    }, "comments");
  }

  if (commentsDoc.length > 0) {
    return label(objectDoc.label, [
      objectDoc,
      indent([hardline, ...commentsDoc, lookupDoc]),
    ]);
  }

  return label(objectDoc.label, [
    objectDoc,
    lineSuffixBoundary,
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
