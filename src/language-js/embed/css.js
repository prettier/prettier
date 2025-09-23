import { hardline, indent, softline } from "../../document/builders.js";
import { cleanDoc, mapDoc, replaceEndOfLine } from "../../document/utils.js";
import isNonEmptyArray from "../../utils/is-non-empty-array.js";
import { printTemplateExpressions } from "../print/template-literal.js";
import { isAngularComponentStyles } from "./utils.js";

async function printEmbedCss(textToDoc, print, path /* , options*/) {
  const { node } = path;

  // Get full template literal with expressions replaced by placeholders
  const rawQuasis = node.quasis.map((q) => q.value.raw);
  let placeholderID = 0;
  const text = rawQuasis.reduce(
    (prevVal, currVal, idx) =>
      idx === 0
        ? currVal
        : prevVal +
          "@prettier-placeholder-" +
          placeholderID++ +
          "-id" +
          currVal,
    "",
  );
  const quasisDoc = await textToDoc(text, { parser: "scss" });
  const expressionDocs = printTemplateExpressions(path, print);
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
function isStyledJsx({ node, parent, grandparent }) {
  return (
    (grandparent &&
      node.quasis &&
      parent.type === "JSXExpressionContainer" &&
      grandparent.type === "JSXElement" &&
      grandparent.openingElement.name.name === "style" &&
      grandparent.openingElement.attributes.some(
        (attribute) =>
          attribute.type === "JSXAttribute" && attribute.name.name === "jsx",
      )) ||
    (parent?.type === "TaggedTemplateExpression" &&
      parent.tag.type === "Identifier" &&
      parent.tag.name === "css") ||
    (parent?.type === "TaggedTemplateExpression" &&
      parent.tag.type === "MemberExpression" &&
      parent.tag.object.name === "css" &&
      (parent.tag.property.name === "global" ||
        parent.tag.property.name === "resolve"))
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

function printCss(path /* , options*/) {
  if (
    isStyledJsx(path) ||
    isStyledComponents(path) ||
    isCssProp(path) ||
    isAngularComponentStyles(path)
  ) {
    return printEmbedCss;
  }
}

export default printCss;
