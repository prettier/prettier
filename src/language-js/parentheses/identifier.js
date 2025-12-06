import {
  isBinaryCastExpression,
  startsWithNoLookaheadToken,
} from "../utilities/index.js";

function shouldAddParenthesesToIdentifier(path) {
  const { node } = path;

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
    /^PRETTIER_HTML_PLACEHOLDER_\d+_\d+_IN_JS$/u.test(node.name)
  ) {
    return true;
  }

  const { key, parent } = path;
  // `for ((async) of []);` and `for ((let) of []);`
  if (
    key === "left" &&
    ((node.name === "async" && !parent.await) || node.name === "let") &&
    parent.type === "ForOfStatement"
  ) {
    return true;
  }

  // `for ((let.a) of []);`
  if (node.name === "let") {
    const expression = path.findAncestor(
      (node) => node.type === "ForOfStatement",
    )?.left;
    if (
      expression &&
      startsWithNoLookaheadToken(
        expression,
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
    const expression = !statement
      ? undefined
      : statement.type === "ExpressionStatement"
        ? statement.expression
        : statement.type === "ForStatement"
          ? statement.init
          : statement.left;
    if (
      expression &&
      startsWithNoLookaheadToken(
        expression,
        (leftmostNode) => leftmostNode === node,
      )
    ) {
      return true;
    }
  }

  // `(type) satisfies never;` and similar cases
  if (key === "expression") {
    switch (node.name) {
      case "await":
      case "interface":
      case "module":
      case "using":
      case "yield":
      case "let":
      case "component":
      case "hook":
      case "type": {
        const ancestorNeitherAsNorSatisfies = path.findAncestor(
          (node) => !isBinaryCastExpression(node),
        );
        if (
          ancestorNeitherAsNorSatisfies !== parent &&
          ancestorNeitherAsNorSatisfies.type === "ExpressionStatement"
        ) {
          return true;
        }
      }
    }
  }

  return false;
}

export { shouldAddParenthesesToIdentifier };
