import { join } from "../../document/index.js";
import { formatAttributeValue } from "./utilities.js";

/** @see https://github.com/angular/angular/blob/main/packages/compiler/src/render3/r3_boundaries.ts */
const LET_PATTERN = /^let\s+(.*)$/s;
const WHEN_PATTERN = /^when\s+(.*)$/s;
const NAMED_BINDING_PATTERN = /^([$A-Z_][\w$]*)\s*=\s*(.*)$/is;

function formatExpression(textToDoc, expression) {
  return formatAttributeValue(expression, textToDoc, {
    parser: "__ng_binding",
    __isInHtmlAttribute: false,
  });
}

async function printLetBindings(textToDoc, bindingsText) {
  const bindings = [];

  for (const part of bindingsText.split(",")) {
    const [rawName, ...rawValue] = part.split("=");
    const name = rawName.trim();
    const value = rawValue.join("=").trim();

    if (!name) {
      return;
    }

    bindings.push(
      value ? [name, " = ", await formatExpression(textToDoc, value)] : name,
    );
  }

  return ["let ", join(", ", bindings)];
}

async function printAngularErrorBlockParameter(
  textToDoc,
  print,
  path /* , options */,
) {
  const expression = path.node.expression.trim();
  const letMatch = expression.match(LET_PATTERN);

  if (letMatch) {
    return (await printLetBindings(textToDoc, letMatch[1])) ?? expression;
  }

  const whenMatch = expression.match(WHEN_PATTERN);
  if (whenMatch?.[1].trim()) {
    return ["when ", await formatExpression(textToDoc, whenMatch[1].trim())];
  }

  const namedMatch = expression.match(NAMED_BINDING_PATTERN);
  if (namedMatch?.[2].trim()) {
    return [
      namedMatch[1],
      " = ",
      await formatExpression(textToDoc, namedMatch[2].trim()),
    ];
  }

  return expression;
}

export default printAngularErrorBlockParameter;
