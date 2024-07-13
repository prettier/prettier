import { group, line, indent } from "../../document/builders.js";
import { formatAttributeValue } from "./utils.js";

export default async function printAngularLetDeclaration(
  textToDoc,
  print,
  path,
  options,
) {
  const { node } = path;

  const leftDoc = node.name;
  const operator = " =";
  const rightDoc = await formatAttributeValue(node.value, textToDoc, {
    parser: "__ng_binding",
    __isInHtmlAttribute: false,
  });
  // print like "break-after-operator" layout assignment
  const printedAssignment = group([
    group(leftDoc),
    operator,
    group(indent([line, rightDoc])),
  ]);
  return group(["@let ", printedAssignment, ";"]);
}
