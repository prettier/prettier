import { hasSameLoc } from "../loc.js";
import { getRaw } from "./get-raw.js";
import { isStringLiteral } from "./node-types.js";

/**
@import {
  Node,
} from "../types/estree.js";
*/

/**
 * @param {Node} specifier
 * @returns {boolean}
 */
function isShorthandSpecifier(specifier) {
  if (
    specifier.type !== "ImportSpecifier" &&
    specifier.type !== "ExportSpecifier"
  ) {
    return false;
  }

  const {
    local,
    // @ts-expect-error -- FIXME
    [specifier.type === "ImportSpecifier" ? "imported" : "exported"]:
      importedOrExported,
  } = specifier;

  if (
    local.type !== importedOrExported.type ||
    !hasSameLoc(local, importedOrExported)
  ) {
    return false;
  }

  if (isStringLiteral(local)) {
    return (
      local.value === importedOrExported.value &&
      getRaw(local) === getRaw(importedOrExported)
    );
  }

  switch (local.type) {
    case "Identifier":
      return local.name === importedOrExported.name;
    default:
      /* c8 ignore next */
      return false;
  }
}

export { isShorthandSpecifier };
