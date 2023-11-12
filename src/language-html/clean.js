import isFrontMatter from "../utils/front-matter/is-front-matter.js";

const ignoredProperties = new Set([
  "sourceSpan",
  "startSourceSpan",
  "endSourceSpan",
  "nameSpan",
  "valueSpan",
  "keySpan",
  "tagDefinition",
  "tokens",
  "valueTokens",
]);

const embeddedAngularControlFlowBlocks = new Set([
  "if",
  "else if",
  "for",
  "switch",
  "case",
]);

function clean(ast, newNode) {
  if (ast.type === "text" || ast.type === "comment") {
    return null;
  }

  // may be formatted by multiparser
  if (isFrontMatter(ast) || ast.type === "yaml" || ast.type === "toml") {
    return null;
  }

  if (ast.type === "attribute") {
    delete newNode.value;
  }

  if (ast.type === "docType") {
    delete newNode.value;
  }

  if (ast.type === "angularControlFlowBlock" && newNode.parameters?.children) {
    for (const parameter of newNode.parameters.children) {
      if (embeddedAngularControlFlowBlocks.has(ast.name)) {
        delete parameter.expression;
      } else {
        parameter.expression = parameter.expression.trim();
      }
    }
  }
}

clean.ignoredProperties = ignoredProperties;

export default clean;
