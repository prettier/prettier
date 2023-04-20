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

function printArrowFunction(path, options, print, args = {}) {
  const { node, parent, key } = path;
  /** @type {Doc[]} */
  const signatures = [];
  /** @type {Doc} */
  let bodyDoc;
  /** @type {*[]} */
  const bodyComments = [];
  let shouldBreakChain = false;
  let tailNode = node;

  (function rec() {
    const { node: currentNode } = path;
    const doc = printArrowFunctionSignature(path, options, print, args);
    if (signatures.length === 0) {
      signatures.push(doc);
    } else {
      const { leading, trailing } = printCommentsSeparately(path, options);
      signatures.push([leading, doc]);
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
      tailNode = currentNode.body;
      path.call(rec, "body");
    }
  })();

  const { body } = tailNode;

  // In order to avoid confusion between
  // a => a ? a : a
  // a <= a ? a : a
  const shouldAddParensIfNotBreak =
    body.type === "ConditionalExpression" &&
    !startsWithNoLookaheadToken(
      body,
      (node) => node.type === "ObjectExpression"
    );

  // We handle sequence expressions as the body of arrows specially,
  // so that the required parentheses end up on their own lines.
  const shouldAlwaysAddParens = body.type === "SequenceExpression";

  const shouldAddParens = shouldAddParensIfNotBreak || shouldAlwaysAddParens;

  // We want to always keep these types of nodes on the same line
  // as the arrow.
  const shouldPutBodyOnSameLine =
    !hasLeadingOwnLineComment(options.originalText, body) &&
    (mayBreakAfterShortPrefix(body, bodyDoc, options) || shouldAddParens);

  const isCallee = isCallLikeExpression(parent) && key === "callee";
  const shouldBreakBeforeChain =
    (isCallee && !shouldPutBodyOnSameLine) ||
    args.assignmentLayout === "chain-tail-arrow-chain";

  const isAssignmentRhs = Boolean(args.assignmentLayout);

  const isChain = signatures.length > 1;

  const chainGroupId = Symbol("arrow-chain");

  const maybeBreakFirst = (doc) => {
    if ((isCallee || isAssignmentRhs) && isChain) {
      return group(indent([softline, doc]), {
        shouldBreak: shouldBreakBeforeChain,
        id: chainGroupId,
      });
    }
    return group(doc, { id: chainGroupId });
  };

  const indentIfChainBreaks = (doc) => {
    if (!isChain) {
      return group(doc);
    }
    return indentIfBreak(doc, { groupId: chainGroupId });
  };

  return group([
    maybeBreakFirst(
      joinArrowFunctionSignatures(signatures, path, {
        isAssignmentRhs,
        shouldBreak: shouldBreakChain,
      })
    ),
    " =>",
    indentIfChainBreaks(
      printArrowFunctionBody(path, options, {
        bodyDoc,
        bodyComments,
        shouldAddParensIfNotBreak,
        shouldAlwaysAddParens,
        shouldPutBodyOnSameLine,
        expandLastArg: Boolean(args.expandLastArg),
      })
    ),
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
 * @param {Doc[]} signatures
 * @param {AstPath} path
 * @param {Object} flags
 * @param {boolean} flags.shouldBreak
 * @param {boolean} flags.isAssignmentRhs
 * @returns {Doc}
 */
function joinArrowFunctionSignatures(
  signatures,
  path,
  { shouldBreak, isAssignmentRhs }
) {
  if (signatures.length === 1) {
    return signatures[0];
  }
  const { parent, key } = path;
  if (
    (key !== "callee" && isCallLikeExpression(parent)) ||
    isBinaryish(parent)
  ) {
    return group(
      [
        signatures[0],
        " =>",
        indent([line, join([" =>", line], signatures.slice(1))]),
      ],
      { shouldBreak }
    );
  }
  if ((key === "callee" && isCallLikeExpression(parent)) || isAssignmentRhs) {
    return group(join([" =>", line], signatures), {
      shouldBreak,
    });
  }
  return group(indent(join([" =>", line], signatures)), {
    shouldBreak,
  });
}

/**
 * @param {AstPath} path
 * @param {*} options
 * @param {Object} arrowFunctionBodyPrintOptions
 * @param {Doc} arrowFunctionBodyPrintOptions.bodyDoc
 * @param {Doc[]} arrowFunctionBodyPrintOptions.bodyComments
 * @param {boolean} arrowFunctionBodyPrintOptions.shouldAddParensIfNotBreak
 * @param {boolean} arrowFunctionBodyPrintOptions.shouldAlwaysAddParens
 * @param {boolean} arrowFunctionBodyPrintOptions.shouldPutBodyOnSameLine
 * @param {boolean} arrowFunctionBodyPrintOptions.expandLastArg
 */
function printArrowFunctionBody(
  path,
  options,
  {
    bodyDoc,
    bodyComments,
    shouldAddParensIfNotBreak,
    shouldAlwaysAddParens,
    shouldPutBodyOnSameLine,
    expandLastArg,
  }
) {
  const { node, parent } = path;

  const trailingComma =
    expandLastArg && shouldPrintComma(options, "all") ? ifBreak(",") : "";

  // if the arrow function is expanded as last argument, we are adding a
  // level of indentation and need to add a softline to align the closing )
  // with the opening (, or if it's inside a JSXExpression (e.g. an attribute)
  // we should align the expression's closing } with the line with the opening {.
  const trailingSpace =
    (expandLastArg || parent.type === "JSXExpressionContainer") &&
    !hasComment(node)
      ? softline
      : "";

  if (shouldAddParensIfNotBreak && shouldPutBodyOnSameLine) {
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

  if (shouldAlwaysAddParens) {
    bodyDoc = group(["(", indent([softline, bodyDoc]), softline, ")"]);
  }

  return shouldPutBodyOnSameLine
    ? [" ", bodyDoc, bodyComments]
    : [indent([line, bodyDoc, bodyComments]), trailingComma, trailingSpace];
}

export { printArrowFunction };
