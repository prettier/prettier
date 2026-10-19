import { CommentCheckFlags, hasComment } from "../utilities/comments.js";
import { isTypeCastComment } from "../utilities/is-type-cast-comment.js";
import {
  isBinaryCastExpression,
  isMemberExpression,
} from "../utilities/node-types.js";
import { startsWithNoLookaheadToken } from "../utilities/starts-with-no-lookahead-token.js";

const namesNeedParenthesesAsExpressionOfBinaryCastExpression = new Set([
  "await",
  "interface",
  "module",
  "using",
  "yield",
  "let",
  "component",
  "hook",
  "type",
]);

function shouldAddParenthesesToIdentifier(path) {
  const { node, key, parent } = path;

  // Identifiers never need parentheses.
  if (node.type !== "Identifier") {
    return false;
  }

  // ...unless those identifiers are embed placeholders. They might be substituted by complex
  // expressions, so the parens around them should not be dropped. Example (JS-in-HTML-in-JS):
  //     let tpl = html`<script> f((${expr}) / 2); </script>`;
  // If the inner JS formatter removes the parens, the expression might change its meaning:
  //     f((a + b) / 2)  vs  f(a + b / 2)
  if (
    node.extra?.parenthesized &&
    /^PRETTIER_HTML_PLACEHOLDER_\d+_\d+_IN_JS$/.test(node.name)
  ) {
    return true;
  }

  // Preserve parentheses around the expression in a member access when a
  // Closure-style type cast comment applies to it. Without the parentheses,
  // the comment moves from the object to the whole member expression on the
  // next formatting pass.
  if (
    key === "object" &&
    node.extra?.parenthesized &&
    isMemberExpression(parent) &&
    hasComment(node, CommentCheckFlags.Leading, isTypeCastComment)
  ) {
    return true;
  }

  // `for ((async) of []);` and `for ((let) of []);`
  if (
    key === "left" &&
    ((node.name === "async" && !parent.await) || node.name === "let") &&
    parent.type === "ForOfStatement"
  ) {
    return true;
  }

  // `for ((let.a) of []);`
  // `for ((let.a) in []);`
  if (node.name === "let") {
    const statement = path.findAncestor(
      (node) =>
        node.type === "ForOfStatement" || node.type === "ForInStatement",
    );
    if (
      statement &&
      startsWithNoLookaheadToken(
        statement.left,
        (leftmostNode) => leftmostNode === node,
      )
    ) {
      return true;
    }
  }

  // `(let)[a] = 1`
  if (
    key === "object" &&
    node.name === "let" &&
    parent.type === "MemberExpression" &&
    parent.computed &&
    !parent.optional
  ) {
    const statement = path.findAncestor(
      (node) =>
        node.type === "ExpressionStatement" ||
        node.type === "ForStatement" ||
        node.type === "ForInStatement",
    );
    if (statement) {
      const expression =
        statement.type === "ExpressionStatement"
          ? statement.expression
          : statement.type === "ForStatement"
            ? statement.init
            : statement.left;
      if (
        startsWithNoLookaheadToken(
          expression,
          (leftmostNode) => leftmostNode === node,
        )
      ) {
        return true;
      }
    }
  }

  if (node.name === "await") {
    const statement = path.findAncestor(
      (node) => node.type === "ExpressionStatement",
    );
    if (statement) {
      const { expression } = statement;
      if (
        startsWithNoLookaheadToken(
          expression,
          (leftmostNode) => leftmostNode === node,
        )
      ) {
        return true;
      }
    }
  }

  // `(type) satisfies never;` and similar cases
  if (
    key === "expression" &&
    isBinaryCastExpression(parent) &&
    namesNeedParenthesesAsExpressionOfBinaryCastExpression.has(node.name) &&
    path.findAncestor((node) => !isBinaryCastExpression(node)).type ===
      "ExpressionStatement"
  ) {
    return true;
  }

  return false;
}

export { shouldAddParenthesesToIdentifier };
