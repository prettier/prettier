import { isFlowMethodSignatureWithNewKey } from "../utilities/is-method-signature-with-new-key.js";
import { isNumericLiteral, isStringLiteral } from "../utilities/node-types.js";

/**
@import {Node} from "../types/estree.js"
*/

function cleanNodeKey(cloned, original, property) {
  const key = original[property];
  if (isStringLiteral(key) || isNumericLiteral(key)) {
    cloned[property] = String(key.value);
  }

  if (key.type === "Identifier") {
    cloned[property] = key.name;
  }
}

/**
@param {Node} original
@param {any} cloned
*/
function cleanKey(original, cloned) {
  // We change {'key': value} into {key: value}.
  // And {key: value} into {'key': value}.
  // Also for (some) number keys.
  if (
    (original.type === "Property" ||
      original.type === "ObjectProperty" ||
      original.type === "MethodDefinition" ||
      original.type === "ClassProperty" ||
      original.type === "ClassMethod" ||
      original.type === "PropertyDefinition" ||
      original.type === "TSDeclareMethod" ||
      original.type === "TSPropertySignature" ||
      original.type === "TSMethodSignature" ||
      original.type === "ObjectTypeProperty" ||
      original.type === "ImportAttribute" ||
      original.type === "RecordDeclarationProperty" ||
      original.type === "RecordDeclarationStaticProperty") &&
    // @ts-expect-error -- safe
    !original.computed &&
    // Flow represents both method and construct signatures as ObjectTypeProperty.
    !isFlowMethodSignatureWithNewKey(original)
  ) {
    cleanNodeKey(cloned, original, "key");
  }

  if (original.type === "TSEnumMember") {
    cleanNodeKey(cloned, original, "id");
  }
}

export { cleanKey };
