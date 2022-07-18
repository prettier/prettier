import { isNonEmptyArray } from "../../common/util.js";
import { indent, hardline, softline } from "../../document/builders.js";
import { mapDoc, replaceEndOfLine, cleanDoc } from "../../document/utils.js";
import { printTemplateExpressions } from "../print/template-literal.js";

async function format(path, print, textToDoc) {
  const node = path.getValue();

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
    ""
  );
  const doc = await textToDoc(
    text,
    { parser: "scss" },
    { stripTrailingHardline: true }
  );
  const expressionDocs = await printTemplateExpressions(path, print);
  return transformCssDoc(doc, node, expressionDocs);
}

function transformCssDoc(quasisDoc, parentNode, expressionDocs) {
  const isEmpty =
    parentNode.quasis.length === 1 && !parentNode.quasis[0].value.raw.trim();
  if (isEmpty) {
    return "``";
  }

  const newDoc = replacePlaceholders(quasisDoc, expressionDocs);
  /* istanbul ignore if */
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
    return doc.split(/@prettier-placeholder-(\d+)-id/).map((component, idx) => {
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

export default format;
