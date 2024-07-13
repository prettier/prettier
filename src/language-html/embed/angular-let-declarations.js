import { group } from "../../document/builders.js";
import { formatAttributeValue } from "./utils.js";
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

  const rightDoc = await formatAttributeValue(node.value, textToDoc, {
    parser: "__ng_binding",
    __isInHtmlAttribute: false,
  });
  const printed = printAssignmentWithLayout(
    path,
    options,
    print,
    /* leftDoc */ node.name,
    /* operator */ " =",
    rightDoc,
    "break-after-operator",
  );
  return group(["@let ", printed, ";"]);
}
