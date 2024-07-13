import { group } from "../../document/builders.js";
import { printAssignmentWithLayout } from "../../language-js/print/assignment.js";
import { formatAttributeValue } from "./utils.js";

export default async function printAngularLetDeclaration(
  textToDoc,
  print,
  path,
  options,
) {
  const { node } = path;

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
