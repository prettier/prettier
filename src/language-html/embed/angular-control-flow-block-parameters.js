import { formatAttributeValue, shouldHugJsExpression } from "./utils.js";

function printAngularControlFlowBlockParameters(
  textToDoc,
  print,
  path,
  /* options,*/
) {
  return formatAttributeValue(
    path.node.raw,
    textToDoc,
    {
      parser: "__ng_directive",
      __isInHtmlAttribute: false,
      trailingComma: "none",
    },
    shouldHugJsExpression,
  );
}

export default printAngularControlFlowBlockParameters;
