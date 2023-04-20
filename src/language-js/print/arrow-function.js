import {
  printDanglingComments,
  printCommentsSeparately,
} from "../../main/comments/print.js";
import getNextNonSpaceNonCommentCharacterIndex from "../../utils/get-next-non-space-non-comment-character-index.js";
import {
  line,
  softline,
  group,
  indent,
  ifBreak,
  join,
  indentIfBreak,
} from "../../document/builders.js";
import { removeLines, willBreak } from "../../document/utils.js";
import { ArgExpansionBailout } from "../../common/errors.js";
import {
  getFunctionParameters,
  hasLeadingOwnLineComment,
  isJsxElement,
  isTemplateOnItsOwnLine,
  shouldPrintComma,
  startsWithNoLookaheadToken,
  isBinaryish,
  hasComment,
  isCallLikeExpression,
  isArrayOrTupleExpression,
  isObjectOrRecordExpression,
} from "../utils/index.js";
import { locEnd } from "../loc.js";
import { printFunctionParameters } from "./function-parameters.js";
import { printReturnType, shouldPrintParamsWithoutParens } from "./function.js";

/**
 * @typedef {import("../../common/ast-path.js").default} AstPath
 * @typedef {import("../../document/builders.js").Doc} Doc
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
          (node) => node.type === "ObjectExpression"
        )
    );
  }
  return shouldAddParensIfNotBreakCache.get(node);
}

// We handle sequence expressions as the body of arrows specially,
// so that the required parentheses end up on their own lines.
const shouldAlwaysAddParens = (node) => node.type === "SequenceExpression";

const isArrowFunctionChain = (node) =>
  node.body.type === "ArrowFunctionExpression";

function getArrowChainFunctionBody(node) {
  while (isArrowFunctionChain(node)) {
    node = node.body;
  }

  return node.body;
}

function printArrowFunction(path, options, print, args = {}) {
  const { node, parent, key } = path;
  /** @type {Doc[]} */
  const signatureDocs = [];
  /** @type {Doc} */
  let bodyDoc;
  /** @type {Doc[]} */
  const bodyComments = [];
  let shouldBreakChain = false;

  (function rec() {
    const { node: currentNode } = path;
    const doc = printArrowFunctionSignature(path, options, print, args);
    if (signatureDocs.length === 0) {
      signatureDocs.push(doc);
    } else {
      const { leading, trailing } = printCommentsSeparately(path, options);
      signatureDocs.push([leading, doc]);
      bodyComments.unshift(trailing);
    }

    shouldBreakChain ||=
      // Always break the chain if:
      (currentNode.returnType &&
        getFunctionParameters(currentNode).length > 0) ||
      currentNode.typeParameters ||
      getFunctionParameters(currentNode).some(
        (param) => param.type !== "Identifier"
      );

    if (
      currentNode.body.type !== "ArrowFunctionExpression" ||
      args.expandLastArg
    ) {
      bodyDoc = print("body", args);
    } else {
      path.call(rec, "body");
    }
  })();

  const isChain = isArrowFunctionChain(node);
  const functionBody = getArrowChainFunctionBody(node);

  // We want to always keep these types of nodes on the same line
  // as the arrow.
  const shouldPutBodyOnSameLine =
    !hasLeadingOwnLineComment(options.originalText, functionBody) &&
    (shouldAlwaysAddParens(functionBody) ||
      mayBreakAfterShortPrefix(functionBody, bodyDoc, options) ||
      shouldAddParensIfNotBreak(functionBody));

  const isCallee = key === "callee" && isCallLikeExpression(parent);

  const chainGroupId = Symbol("arrow-chain");

  const signaturesDoc = printArrowFunctionSignatures(path, args, {
    signatureDocs,
    shouldBreak: shouldBreakChain,
  });
  let shouldBreakSignatures;
  let shouldIndentSignatures = false;
  if (
    isChain &&
    (isCallee ||
      // isAssignmentRhs
      args.assignmentLayout)
  ) {
    shouldIndentSignatures = true;
    shouldBreakSignatures =
      args.assignmentLayout === "chain-tail-arrow-chain" ||
      (isCallee && !shouldPutBodyOnSameLine);
  }

  bodyDoc = printArrowFunctionBody(path, options, args, {
    bodyDoc,
    bodyComments,
    shouldPutBodyOnSameLine,
  });

  return group([
    group(
      shouldIndentSignatures
        ? indent([softline, signaturesDoc])
        : signaturesDoc,
      { shouldBreak: shouldBreakSignatures, id: chainGroupId }
    ),
    " =>",
    isChain
      ? indentIfBreak(bodyDoc, { groupId: chainGroupId })
      : group(bodyDoc),
    isChain && isCallee ? ifBreak(softline, "", { groupId: chainGroupId }) : "",
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
          print,
          options,
          expandArg,
          /* printTypeParams */ true
        ),
        returnTypeDoc,
      ])
    );
  }

  const dangling = printDanglingComments(path, options, {
    filter(comment) {
      const nextCharacter = getNextNonSpaceNonCommentCharacterIndex(
        options.originalText,
        locEnd(comment)
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
 * @param {*} node
 * @param {*} bodyDoc
 * @param {*} options
 * @returns {boolean}
 */
function mayBreakAfterShortPrefix(node, bodyDoc, options) {
  return (
    isArrayOrTupleExpression(node) ||
    isObjectOrRecordExpression(node) ||
    node.type === "BlockStatement" ||
    isJsxElement(node) ||
    (bodyDoc.label?.hug !== false &&
      (bodyDoc.label?.embed ||
        isTemplateOnItsOwnLine(node, options.originalText))) ||
    node.type === "ArrowFunctionExpression" ||
    node.type === "DoExpression"
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
  { signatureDocs, shouldBreak }
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
      { shouldBreak }
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
 * @param {boolean} arrowFunctionBodyPrintOptions.shouldPutBodyOnSameLine
 */
function printArrowFunctionBody(
  path,
  options,
  args,
  { bodyDoc, bodyComments, shouldPutBodyOnSameLine }
) {
  const { node, parent } = path;
  const functionBody = getArrowChainFunctionBody(node);

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

  if (shouldAlwaysAddParens(functionBody)) {
    bodyDoc = group(["(", indent([softline, bodyDoc]), softline, ")"]);
  }

  return shouldPutBodyOnSameLine
    ? [" ", bodyDoc, bodyComments]
    : [indent([line, bodyDoc, bodyComments]), trailingComma, trailingSpace];
}

export { printArrowFunction };
