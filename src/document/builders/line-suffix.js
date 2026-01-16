import { assertDoc } from "../utilities/assert-doc.js";
import { DOC_TYPE_LINE_SUFFIX } from "./types.js";

/**
@import {Doc} from "./index.js";
@typedef {{readonly type: DOC_TYPE_LINE_SUFFIX, readonly contents: Doc}} LineSuffix
*/

/**
@param {Doc} contents
@returns {LineSuffix}
*/
function lineSuffix(contents) {
  assertDoc(contents);

  return { type: DOC_TYPE_LINE_SUFFIX, contents };
}

export { lineSuffix };
