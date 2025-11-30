import {
  cleanDoc,
  hardline,
  indent,
  mapDoc,
  replaceEndOfLine,
  softline,
} from "../../document/index.js";
import isNonEmptyArray from "../../utilities/is-non-empty-array.js";
import { printTemplateExpressions } from "../print/template-literal.js";
import isNodeMatches from "../utilities/is-node-matches.js";
import { isAngularComponentStyles } from "./utilities.js";

async function printEmbedCss(textToDoc, print, path, options) {
  const { node } = path;

  // Get full template literal with expressions replaced by placeholders
  let text = "";
  for (const [index, quasis] of node.quasis.entries()) {
    const { raw } = quasis.value;

    if (index > 0) {
      text += "@prettier-placeholder-" + (index - 1) + "-id";
    }

    text += raw;
  }
  const quasisDoc = await textToDoc(text, { parser: "scss" });
  const expressionDocs = printTemplateExpressions(path, options, print);
  const newDoc = replacePlaceholders(quasisDoc, expressionDocs);
  /* c8 ignore next 3 */
  if (!newDoc) {
    throw new Error("Couldn't insert all the expressions");
  }
  return ["`", indent([hardline, newDoc]), softline, "`"];
}

// Search all the placeholders in the quasisDoc tree
// and replace them with the expression docs one by one
// returns a new doc with all the placeholders replaced,
// or null if it couldn't replace any expression
function replacePlaceholders(quasisDoc, expressionDocs) {
  if (!isNonEmptyArray(expressionDocs)) {
    return quasisDoc;
  }
  let replaceCounter = 0;
  const newDoc = mapDoc(cleanDoc(quasisDoc), (doc) => {
    if (typeof doc !== "string" || !doc.includes("@prettier-placeholder")) {
      return doc;
    }
    // When we have multiple placeholders in one line, like:
    // ${Child}${Child2}:not(:first-child)
    return doc
      .split(/@prettier-placeholder-(\d+)-id/u)
      .map((component, idx) => {
        // The placeholder is always at odd indices
        if (idx % 2 === 0) {
          return replaceEndOfLine(component);
        }

        // The component will always be a number at odd index
        replaceCounter++;
        return expressionDocs[component];
      });
  });
  return expressionDocs.length === replaceCounter ? newDoc : null;
}

/**
 * Template literal in these contexts:
 * <style jsx>{`div{color:red}`}</style>
 * css``
 * css.global``
 * css.resolve``
 */
function isStyledJsx(path) {
  return (
    path.match(
      undefined,
      (node, key) =>
        key === "quasi" &&
        node.type === "TaggedTemplateExpression" &&
        isNodeMatches(node.tag, ["css", "css.global", "css.resolve"]),
    ) ||
    path.match(
      undefined,
      (node, key) =>
        key === "expression" && node.type === "JSXExpressionContainer",
      (node, key) =>
        key === "children" &&
        node.type === "JSXElement" &&
        node.openingElement.name.type === "JSXIdentifier" &&
        node.openingElement.name.name === "style" &&
        node.openingElement.attributes.some(
          (attribute) =>
            attribute.type === "JSXAttribute" &&
            attribute.name.type === "JSXIdentifier" &&
            attribute.name.name === "jsx",
        ),
    )
  );
}

function isStyledIdentifier(node) {
  return node.type === "Identifier" && node.name === "styled";
}

function isStyledExtend(node) {
  return /^[A-Z]/u.test(node.object.name) && node.property.name === "extend";
}

/**
 * styled-components template literals
 */
function isStyledComponents({ parent }) {
  if (!parent || parent.type !== "TaggedTemplateExpression") {
    return false;
  }

  const tag =
    parent.tag.type === "ParenthesizedExpression"
      ? parent.tag.expression
      : parent.tag;

  switch (tag.type) {
    case "MemberExpression":
      return (
        // styled.foo``
        isStyledIdentifier(tag.object) ||
        // Component.extend``
        isStyledExtend(tag)
      );

    case "CallExpression":
      return (
        // styled(Component)``
        isStyledIdentifier(tag.callee) ||
        (tag.callee.type === "MemberExpression" &&
          ((tag.callee.object.type === "MemberExpression" &&
            // styled.foo.attrs({})``
            (isStyledIdentifier(tag.callee.object.object) ||
              // Component.extend.attrs({})``
              isStyledExtend(tag.callee.object))) ||
            // styled(Component).attrs({})``
            (tag.callee.object.type === "CallExpression" &&
              isStyledIdentifier(tag.callee.object.callee))))
      );

    case "Identifier":
      // css``
      return tag.name === "css";

    default:
      return false;
  }
}

/**
 * JSX element with CSS prop
 */
function isCssProp({ parent, grandparent }) {
  return (
    grandparent?.type === "JSXAttribute" &&
    parent.type === "JSXExpressionContainer" &&
    grandparent.name.type === "JSXIdentifier" &&
    grandparent.name.name === "css"
  );
}

const isEmbedCss = (path /* , options*/) =>
  isStyledJsx(path) ||
  isStyledComponents(path) ||
  isCssProp(path) ||
  isAngularComponentStyles(path);

export { isEmbedCss, printEmbedCss };
