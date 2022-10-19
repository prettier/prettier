import { isNonEmptyArray } from "../../common/util.js";
import { indent, hardline, softline } from "../../document/builders.js";
import { mapDoc, replaceEndOfLine, cleanDoc } from "../../document/utils.js";
import { printTemplateExpressions } from "../print/template-literal.js";

async function embedCss(textToDoc, print, path /*, options*/) {
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
    ""
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

export default embedCss;
