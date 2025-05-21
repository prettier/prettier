import { ArgExpansionBailout } from "../../common/errors.js";
import {
  group,
  ifBreak,
  indent,
  indentIfBreak,
  join,
  line,
  softline,
} from "../../document/builders.js";
import { removeLines, willBreak } from "../../document/utils.js";
import {
  printCommentsSeparately,
  printDanglingComments,
} from "../../main/comments/print.js";
import getNextNonSpaceNonCommentCharacterIndex from "../../utils/get-next-non-space-non-comment-character-index.js";
import { locEnd } from "../loc.js";
import {
  CommentCheckFlags,
  getFunctionParameters,
  hasComment,
  hasLeadingOwnLineComment,
  isArrayExpression,
  isBinaryish,
  isCallLikeExpression,
  isJsxElement,
  isObjectExpression,
  isTemplateOnItsOwnLine,
  shouldPrintComma,
  startsWithNoLookaheadToken,
} from "../utils/index.js";
import { printReturnType, shouldPrintParamsWithoutParens } from "./function.js";
import { printFunctionParameters } from "./function-parameters.js";

/**
 * @import AstPath from "../../common/ast-path.js"
 * @import {Doc} from "../../document/builders.js"
 */

// In order to avoid confusion between
// a => a ? a : a
// a <= a ? a : a
const shouldAddParensIfNotBreakCache = new WeakMap();
function shouldAddParensIfNotBreak(node) {
  if (!shouldAddParensIfNotBreakCache.has(node)) {
    shouldAddParensIfNotBreakCache.set(
      node,
      node.type === "ConditionalExpression" &&
        !startsWithNoLookaheadToken(
          node,
          (node) => node.type === "ObjectExpression",
        ),
    );
  }
  return shouldAddParensIfNotBreakCache.get(node);
}

// We handle sequence expressions as the body of arrows specially,
// so that the required parentheses end up on their own lines.
const shouldAlwaysAddParens = (node) => node.type === "SequenceExpression";

function printArrowFunction(path, options, print, args = {}) {
  /** @type {Doc[]} */
  const signatureDocs = [];
  /** @type {Doc} */
  let bodyDoc;
  /** @type {Doc[]} */
  const bodyComments = [];
  let shouldBreakChain = false;
  const shouldPrintAsChain =
    !args.expandLastArg && path.node.body.type === "ArrowFunctionExpression";
  let functionBody;

  (function rec() {
    const { node } = path;
    const signatureDoc = printArrowFunctionSignature(
      path,
      options,
      print,
      args,
    );
    if (signatureDocs.length === 0) {
      signatureDocs.push(signatureDoc);
    } else {
      const { leading, trailing } = printCommentsSeparately(path, options);
      signatureDocs.push([leading, signatureDoc]);
      bodyComments.unshift(trailing);
    }

    if (shouldPrintAsChain) {
      shouldBreakChain ||=
        // Always break the chain if:
        (node.returnType && getFunctionParameters(node).length > 0) ||
        node.typeParameters ||
        getFunctionParameters(node).some(
          (param) => param.type !== "Identifier",
        );
    }

    if (!shouldPrintAsChain || node.body.type !== "ArrowFunctionExpression") {
      bodyDoc = print("body", args);
      functionBody = node.body;
    } else {
      path.call(rec, "body");
    }
  })();

  // We want to always keep these types of nodes on the same line
  // as the arrow.
  const shouldPutBodyOnSameLine =
    !hasLeadingOwnLineComment(options.originalText, functionBody) &&
    (shouldAlwaysAddParens(functionBody) ||
      mayBreakAfterShortPrefix(functionBody, bodyDoc, options) ||
      (!shouldBreakChain && shouldAddParensIfNotBreak(functionBody)));

  const isCallee = path.key === "callee" && isCallLikeExpression(path.parent);
  const chainGroupId = Symbol("arrow-chain");

  const signaturesDoc = printArrowFunctionSignatures(path, args, {
    signatureDocs,
    shouldBreak: shouldBreakChain,
  });
  let shouldBreakSignatures = false;
  let shouldIndentSignatures = false;
  let shouldPrintSoftlineInIndent = false;
  if (
    shouldPrintAsChain &&
    (isCallee ||
      // isAssignmentRhs
      args.assignmentLayout)
  ) {
    shouldIndentSignatures = true;
    // If the arrow function has a leading line comment, there should be a hardline above it
    // so we should not print a softline in indent call
    // https://github.com/prettier/prettier/issues/16067
    shouldPrintSoftlineInIndent = !hasComment(
      path.node,
      CommentCheckFlags.Leading & CommentCheckFlags.Line,
    );
    shouldBreakSignatures =
      args.assignmentLayout === "chain-tail-arrow-chain" ||
      (isCallee && !shouldPutBodyOnSameLine);
  }

  bodyDoc = printArrowFunctionBody(path, options, args, {
    bodyDoc,
    bodyComments,
    functionBody,
    shouldPutBodyOnSameLine,
  });

  return group([
    group(
      shouldIndentSignatures
        ? indent([shouldPrintSoftlineInIndent ? softline : "", signaturesDoc])
        : signaturesDoc,
      { shouldBreak: shouldBreakSignatures, id: chainGroupId },
    ),
    " =>",
    shouldPrintAsChain
      ? indentIfBreak(bodyDoc, { groupId: chainGroupId })
      : group(bodyDoc),
    shouldPrintAsChain && isCallee
      ? ifBreak(softline, "", { groupId: chainGroupId })
      : "",
  ]);
}

function printArrowFunctionSignature(path, options, print, args) {
  const { node } = path;
  const parts = [];

  if (node.async) {
    parts.push("async ");
  }

  if (shouldPrintParamsWithoutParens(path, options)) {
    parts.push(print(["params", 0]));
  } else {
    const expandArg = args.expandLastArg || args.expandFirstArg;
    let returnTypeDoc = printReturnType(path, print);
    if (expandArg) {
      if (willBreak(returnTypeDoc)) {
        throw new ArgExpansionBailout();
      }
      returnTypeDoc = group(removeLines(returnTypeDoc));
    }
    parts.push(
      group([
        printFunctionParameters(
          path,
          options,
          print,
          expandArg,
          /* printTypeParams */ true,
        ),
        returnTypeDoc,
      ]),
    );
  }

  const dangling = printDanglingComments(path, options, {
    filter(comment) {
      const nextCharacter = getNextNonSpaceNonCommentCharacterIndex(
        options.originalText,
        locEnd(comment),
      );
      return (
        nextCharacter !== false &&
        options.originalText.slice(nextCharacter, nextCharacter + 2) === "=>"
      );
    },
  });
  if (dangling) {
    parts.push(" ", dangling);
  }
  return parts;
}

/**
 *
 * @param {*} functionBody
 * @param {*} bodyDoc
 * @param {*} options
 * @returns {boolean}
 */
function mayBreakAfterShortPrefix(functionBody, bodyDoc, options) {
  return (
    isArrayExpression(functionBody) ||
    isObjectExpression(functionBody) ||
    functionBody.type === "ArrowFunctionExpression" ||
    functionBody.type === "DoExpression" ||
    functionBody.type === "BlockStatement" ||
    isJsxElement(functionBody) ||
    (bodyDoc.label?.hug !== false &&
      (bodyDoc.label?.embed ||
        isTemplateOnItsOwnLine(functionBody, options.originalText)))
  );
}

/**
 * @param {AstPath} path
 * @param {*} args
 * @param {Object} arrowFunctionSignaturesPrintOptions
 * @param {Doc[]} arrowFunctionSignaturesPrintOptions.signatureDocs
 * @param {boolean} arrowFunctionSignaturesPrintOptions.shouldBreak
 * @returns {Doc}
 */
function printArrowFunctionSignatures(
  path,
  args,
  { signatureDocs, shouldBreak },
) {
  if (signatureDocs.length === 1) {
    return signatureDocs[0];
  }

  const { parent, key } = path;
  if (
    (key !== "callee" && isCallLikeExpression(parent)) ||
    isBinaryish(parent)
  ) {
    return group(
      [
        signatureDocs[0],
        " =>",
        indent([line, join([" =>", line], signatureDocs.slice(1))]),
      ],
      { shouldBreak },
    );
  }

  if (
    (key === "callee" && isCallLikeExpression(parent)) ||
    // isAssignmentRhs
    args.assignmentLayout
  ) {
    return group(join([" =>", line], signatureDocs), { shouldBreak });
  }

  return group(indent(join([" =>", line], signatureDocs)), { shouldBreak });
}

/**
 * @param {AstPath} path
 * @param {*} options
 * @param {*} args
 * @param {Object} arrowFunctionBodyPrintOptions
 * @param {Doc} arrowFunctionBodyPrintOptions.bodyDoc
 * @param {Doc[]} arrowFunctionBodyPrintOptions.bodyComments
 * @param {*} arrowFunctionBodyPrintOptions.functionBody
 * @param {boolean} arrowFunctionBodyPrintOptions.shouldPutBodyOnSameLine
 */
function printArrowFunctionBody(
  path,
  options,
  args,
  { bodyDoc, bodyComments, functionBody, shouldPutBodyOnSameLine },
) {
  const { node, parent } = path;

  const trailingComma =
    args.expandLastArg && shouldPrintComma(options, "all") ? ifBreak(",") : "";

  // if the arrow function is expanded as last argument, we are adding a
  // level of indentation and need to add a softline to align the closing )
  // with the opening (, or if it's inside a JSXExpression (e.g. an attribute)
  // we should align the expression's closing } with the line with the opening {.
  const trailingSpace =
    (args.expandLastArg || parent.type === "JSXExpressionContainer") &&
    !hasComment(node)
      ? softline
      : "";

  if (shouldPutBodyOnSameLine && shouldAddParensIfNotBreak(functionBody)) {
    return [
      " ",
      group([
        ifBreak("", "("),
        indent([softline, bodyDoc]),
        ifBreak("", ")"),
        trailingComma,
        trailingSpace,
      ]),
      bodyComments,
    ];
  }

  return shouldPutBodyOnSameLine
    ? [" ", bodyDoc, bodyComments]
    : [indent([line, bodyDoc, bodyComments]), trailingComma, trailingSpace];
}

export { printArrowFunction };
