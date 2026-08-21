import {
  align,
  cleanDoc,
  DOC_TYPE_ARRAY,
  DOC_TYPE_FILL,
  DOC_TYPE_GROUP,
  DOC_TYPE_LABEL,
  getDocType,
  group,
  indent,
  indentIfBreak,
  join,
  line,
  softline,
} from "../../document/index.js";
import { printComments } from "../../main/comments/print.js";
import { CommentCheckFlags, hasComment } from "../utilities/comments.js";
import { hasLeadingOwnLineComment } from "../utilities/has-leading-own-line-comment.js";
import { isBooleanTypeCoercion } from "../utilities/is-boolean-type-coercion.js";
import { isObjectProperty } from "../utilities/is-object-property.js";
import { isTypeCastComment } from "../utilities/is-type-cast-comment.js";
import {
  isArrayExpression,
  isBinaryish,
  isCallOrNewExpression,
  isJsxElement,
  isMemberExpression,
  isObjectExpression,
  isReturnOrThrowStatement,
} from "../utilities/node-types.js";
import { shouldFlatten } from "../utilities/should-flatten.js";

/** @import {Doc} from "../../document/index.js" */

let uid = 0;
/*
- `BinaryExpression`
- `LogicalExpression`
- `NGPipeExpression`(Angular)
*/
function printBinaryishExpression(path, options, print) {
  const { node, parent, grandparent, key } = path;
  const isInsideParenthesis =
    key !== "body" &&
    (parent.type === "IfStatement" ||
      parent.type === "WhileStatement" ||
      parent.type === "SwitchStatement" ||
      parent.type === "DoWhileStatement");
  const isHackPipeline =
    node.operator === "|>" && path.root.extra?.__isUsingHackPipeline;

  const parts = printBinaryishExpressions(
    path,
    options,
    print,
    /* isNested */ false,
    isInsideParenthesis,
  );

  //   if (
  //     this.hasPlugin("dynamicImports") && this.lookahead().type === tt.parenLeft
  //   ) {
  //
  // looks super weird, we want to break the children if the parent breaks
  //
  //   if (
  //     this.hasPlugin("dynamicImports") &&
  //     this.lookahead().type === tt.parenLeft
  //   ) {
  if (isInsideParenthesis) {
    return parts;
  }

  if (isHackPipeline) {
    return group(parts);
  }

  // Break between the parens in
  // unaries or in a member or specific call expression, i.e.
  //
  //   (
  //     a &&
  //     b &&
  //     c
  //   ).call()
  if (
    (key === "callee" && isCallOrNewExpression(parent)) ||
    // `UnaryExpression` adds parentheses and indention when argument has comment
    (parent.type === "UnaryExpression" && !hasComment(node)) ||
    (isMemberExpression(parent) && !parent.computed)
  ) {
    return group([indent([softline, ...parts]), softline]);
  }

  // Avoid indenting sub-expressions in some cases where the first sub-expression is already
  // indented accordingly. We should indent sub-expressions where the first case isn't indented.
  const shouldNotIndent =
    isReturnOrThrowStatement(parent) ||
    (parent.type === "JSXExpressionContainer" &&
      grandparent.type === "JSXAttribute") ||
    (node.operator !== "|" && parent.type === "JsExpressionRoot") ||
    (node.type !== "NGPipeExpression" &&
      ((parent.type === "NGRoot" && options.parser === "__ng_binding") ||
        (parent.type === "NGMicrosyntaxExpression" &&
          grandparent.type === "NGMicrosyntax" &&
          grandparent.body.length === 1))) ||
    (node === parent.body && parent.type === "ArrowFunctionExpression") ||
    (node !== parent.body && parent.type === "ForStatement") ||
    (parent.type === "ConditionalExpression" &&
      !isReturnOrThrowStatement(grandparent) &&
      !isCallOrNewExpression(grandparent)) ||
    parent.type === "TemplateLiteral" ||
    (key === "argument" && parent.type === "UnaryExpression") ||
    (key === "arguments" && isBooleanTypeCoercion(parent));

  const shouldIndentIfInlining =
    parent.type === "AssignmentExpression" ||
    parent.type === "VariableDeclarator" ||
    parent.type === "ClassProperty" ||
    parent.type === "PropertyDefinition" ||
    parent.type === "TSAbstractPropertyDefinition" ||
    parent.type === "ClassPrivateProperty" ||
    isObjectProperty(parent);

  const samePrecedenceSubExpression =
    isBinaryish(node.left) && shouldFlatten(node.operator, node.left.operator);

  if (
    shouldNotIndent ||
    (shouldInlineLogicalExpression(node) && !samePrecedenceSubExpression) ||
    (!shouldInlineLogicalExpression(node) && shouldIndentIfInlining)
  ) {
    return group(parts);
  }

  if (parts.length === 0) {
    return "";
  }

  // If the right part is a JSX node, we include it in a separate group to
  // prevent it breaking the whole chain, so we can print the expression like:
  //
  //   foo && bar && (
  //     <Foo>
  //       <Bar />
  //     </Foo>
  //   )

  const hasJsx = isJsxElement(node.right);

  const firstGroupIndex = parts.findIndex(
    (part) =>
      typeof part !== "string" &&
      !Array.isArray(part) &&
      part.type === DOC_TYPE_GROUP,
  );

  // Separate the leftmost expression, possibly with its leading comments.
  const headParts = parts.slice(
    0,
    firstGroupIndex === -1 ? 1 : firstGroupIndex + 1,
  );

  const rest = parts.slice(headParts.length, hasJsx ? -1 : undefined);

  const groupId = Symbol("logicalChain-" + ++uid);

  const chain = group(
    [
      // Don't include the initial expression in the indentation
      // level. The first item is guaranteed to be the first
      // left-most expression.
      ...headParts,
      indent(rest),
    ],
    { id: groupId },
  );

  if (!hasJsx) {
    return chain;
  }

  const jsxPart = parts.at(-1);
  return group([chain, indentIfBreak(jsxPart, { groupId })]);
}

// For binary expressions to be consistent, we need to group
// subsequent operators with the same precedence level under a single
// group. Otherwise they will be nested such that some of them break
// onto new lines but not all. Operators with the same precedence
// level should either all break or not. Because we group them by
// precedence level and the AST is structured based on precedence
// level, things are naturally broken up correctly, i.e. `&&` is
// broken before `+`.
function printBinaryishExpressions(
  path,
  options,
  print,
  isNested,
  isInsideParenthesis,
) {
  const { node: rootNode } = path;

  // Simply print the node normally.
  if (!isBinaryish(rootNode)) {
    return [group(print())];
  }

  // We treat BinaryExpression and LogicalExpression nodes the same.

  // Put all operators with the same precedence level in the same
  // group. The reason we only need to do this with the `left`
  // expression is because given an expression like `1 + 2 - 3`, it
  // is always parsed like `((1 + 2) - 3)`, meaning the `left` side
  // is where the rest of the expression will exist. Binary
  // expressions on the right side mean they have a difference
  // precedence level and should be treated as a separate group, so
  // print them normally. (This doesn't hold for the `**` operator,
  // which is unique in that it is right-associative.)
  //
  // Walk down the flattenable left-spine iteratively (instead of
  // recursively calling this function) and then build the doc for each
  // level on the way back up. A long chain (`a + b + c + ...`) nests as
  // deeply as it is long, so recursing here would make call-stack depth
  // proportional to chain length.
  /** @type{Doc[]} */
  let parts;
  let depth = 0;
  {
    let current = rootNode;
    // `shouldFlatten` only compares operator strings, so it doesn't by
    // itself guarantee `current.left` is a binaryish node (with its own
    // `.left`/`.right`) — confirm that before descending into it, same as
    // the `isBinaryish` guard the (now-inlined) recursive call used to have.
    // @ts-expect-error -- FIXME
    while (
      isBinaryish(current.left) &&
      shouldFlatten(current.operator, current.left.operator)
    ) {
      path.stack.push("left", current.left);
      current = current.left;
      depth++;
    }
    parts = [group(print("left"))];
  }

  for (let level = depth; level >= 0; level--) {
    const { node } = path;

    const shouldInline = shouldInlineLogicalExpression(node);
    const rightNodeToCheckComments =
      node.right.type === "ChainExpression"
        ? node.right.expression
        : node.right;
    const lineBeforeOperator =
      (node.type === "NGPipeExpression" ||
        node.operator === "|>" ||
        isVueFilterSequenceExpression(path, options)) &&
      !hasLeadingOwnLineComment(
        options.originalText,
        rightNodeToCheckComments,
      );
    const hasTypeCastComment = hasComment(
      rightNodeToCheckComments,
      CommentCheckFlags.Leading,
      isTypeCastComment,
    );
    const commentBeforeOperator =
      !hasTypeCastComment &&
      hasLeadingOwnLineComment(options.originalText, rightNodeToCheckComments);

    const operator = node.type === "NGPipeExpression" ? "|" : node.operator;
    const rightSuffix =
      node.type === "NGPipeExpression" && node.arguments.length > 0
        ? group(
            indent([
              softline,
              ": ",
              join(
                [line, ": "],
                path.map(() => align(2, group(print())), "arguments"),
              ),
            ]),
          )
        : "";

    /** @type {Doc} */
    let right;
    if (shouldInline) {
      right = [
        operator,
        hasLeadingOwnLineComment(
          options.originalText,
          rightNodeToCheckComments,
        )
          ? indent([line, print("right"), rightSuffix])
          : [" ", print("right"), rightSuffix],
      ];
    } else {
      const isHackPipeline =
        operator === "|>" && path.root.extra?.__isUsingHackPipeline;
      const rightContent = isHackPipeline
        ? path.call(
            () =>
              printBinaryishExpressions(
                path,
                options,
                print,
                /* isNested */ true,
                isInsideParenthesis,
              ),
            "right",
          )
        : print("right");
      if (options.experimentalOperatorPosition === "start") {
        let comment = "";
        if (commentBeforeOperator) {
          switch (getDocType(rightContent)) {
            case DOC_TYPE_ARRAY:
              comment = rightContent[0];
              rightContent.shift();
              break;
            case DOC_TYPE_LABEL:
              comment = rightContent.contents[0];
              rightContent.contents.shift();
              break;
          }
        }
        right = [line, comment, operator, " ", rightContent, rightSuffix];
      } else {
        right = [
          lineBeforeOperator ? line : "",
          operator,
          lineBeforeOperator ? " " : line,
          rightContent,
          rightSuffix,
        ];
      }
    }

    // If there's only a single binary expression, we want to create a group
    // in order to avoid having a small right part like -1 be on its own line.
    const { parent } = path;
    const shouldBreak = hasComment(
      node.left,
      CommentCheckFlags.Trailing | CommentCheckFlags.Line,
    );
    const shouldGroup =
      shouldBreak ||
      (!(isInsideParenthesis && node.type === "LogicalExpression") &&
        parent.type !== node.type &&
        node.left.type !== node.type &&
        node.right.type !== node.type);
    if (shouldGroup) {
      right = group(right, { shouldBreak });
    }

    if (options.experimentalOperatorPosition === "start") {
      parts.push(shouldInline || commentBeforeOperator ? " " : "", right);
    } else {
      parts.push(lineBeforeOperator ? "" : " ", right);
    }

    // The root comments are already printed, but we need to manually print
    // the other ones since we don't call the normal print on BinaryExpression,
    // only for the left and right parts
    const nodeIsNested = level === 0 ? isNested : true;
    if (nodeIsNested && hasComment(node)) {
      const printed = cleanDoc(printComments(path, parts, options));
      /* c8 ignore next 3 */
      parts =
        printed.type === DOC_TYPE_FILL
          ? printed.parts
          : Array.isArray(printed)
            ? printed
            : [printed];
    }

    if (level > 0) {
      path.stack.length -= 2;
    }
  }

  return parts;
}

function shouldInlineLogicalExpression(node) {
  if (node.type !== "LogicalExpression") {
    return false;
  }

  if (isObjectExpression(node.right) && node.right.properties.length > 0) {
    return true;
  }

  if (isArrayExpression(node.right) && node.right.elements.length > 0) {
    return true;
  }

  if (isJsxElement(node.right)) {
    return true;
  }

  return false;
}

const isBitwiseOrExpression = (node) =>
  node.type === "BinaryExpression" && node.operator === "|";

function isVueFilterSequenceExpression(path, options) {
  return (
    (options.parser === "__vue_expression" ||
      options.parser === "__vue_ts_expression") &&
    isBitwiseOrExpression(path.node) &&
    !path.hasAncestor(
      (node) =>
        !isBitwiseOrExpression(node) && node.type !== "JsExpressionRoot",
    )
  );
}

export { printBinaryishExpression, shouldInlineLogicalExpression };
