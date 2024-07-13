import { formatAttributeValue, shouldHugJsExpression } from "./utils.js";
import { printAssignmentWithLayout } from "../../language-js/print/assignment.js";

export default async function printAngularLetDeclarations(
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
  const isEmpty = /^\s*$/u.test(content);

  if (isEmpty) {
    return "";
  }

  const leftDoc = ["@let ", node.name];
  const operator = " =";
  const rightDoc = await formatAttributeValue(
    node.value,
    textToDoc,
    {
      parser: "__ng_binding",
      __isInHtmlAttribute: false,
    },
    shouldHugJsExpression,
  );

  return [
    printAssignmentWithLayout(
      path,
      options,
      print,
      leftDoc,
      operator,
      rightDoc,
      "fluid",
    ),
    // semicolon is required
    ";",
  ];
}
