import { assertDoc } from "../utilities/assert-doc.js";
import { DOC_TYPE_INDENT } from "./types.js";

/**
@import {Doc} from "./index.js";
@typedef {{readonly type: DOC_TYPE_INDENT, contents: Doc}} Indent
*/

/**
@param {Doc} contents
@returns {Indent}
*/
function indent(contents) {
  assertDoc(contents);

  return { type: DOC_TYPE_INDENT, contents };
}

export { indent };
