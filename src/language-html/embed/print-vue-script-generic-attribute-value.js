import { getUnescapedAttributeValue } from "../utilities/index.js";
import { formatAttributeValue, shouldHugJsExpression } from "./utilities.js";

/**
 * @import {Doc} from "../../document/index.js"
 */

/**
 * @returns {Promise<Doc>}
 */
function printVueScriptGenericAttributeValue(
  textToDoc,
  print,
  path,
  /* , options*/
) {
  const value = getUnescapedAttributeValue(path.node);

  return formatAttributeValue(
    `type T<${value}> = any`,
    textToDoc,
    {
      parser: "babel-ts",
      __isEmbeddedTypescriptGenericParameters: true,
    },
    shouldHugJsExpression,
  );
}

export { printVueScriptGenericAttributeValue };
