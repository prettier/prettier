import { formatAttributeValue, shouldHugJsExpression } from "./utils.js";

function printAngularControlFlowBlockParameters(
  textToDoc,
  print,
  path,
  options,
) {
  const { node } = path;

  const content = options.originalText.slice(
    node.sourceSpan.start.offset,
    node.sourceSpan.end.offset,
  );
  const isEmpty = /^\s*$/.test(content);

  if (isEmpty) {
    return "";
  }

  return formatAttributeValue(
    content,
    textToDoc,
    {
      parser: "__ng_directive",
      __isInHtmlAttribute: false,
    },
    shouldHugJsExpression,
  );
}

export default printAngularControlFlowBlockParameters;
