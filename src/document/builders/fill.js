import { assertDocFillParts } from "../utilities/assert-doc.js";
import { DOC_TYPE_FILL } from "./types.js";

/**
@import {Doc} from "./index.js";
@typedef {{
  readonly type: DOC_TYPE_FILL,
  readonly parts: readonly Doc[],
}} Fill
*/

/**
@param {readonly Doc[]} parts
@returns {Fill}
*/
function fill(parts) {
  assertDocFillParts(parts);

  return { type: DOC_TYPE_FILL, parts };
}

export { fill };
