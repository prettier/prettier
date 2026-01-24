import { assertDoc } from "../utilities/assert-doc.js";
import { DOC_TYPE_IF_BREAK } from "./types.js";

/**
@import {Doc} from "./index.js";
@import {GroupId} from "./group.js";
@typedef {{
  readonly type: DOC_TYPE_IF_BREAK,
  readonly breakContents: Doc,
  readonly flatContents: Doc,
  readonly groupId: GroupId,
}} IfBreak
@typedef {{groupId?: GroupId}} IfBreakOptions
*/

/**
@param {Doc} breakContents
@param {Doc} [flatContents = ""]
@param {IfBreakOptions} [options]
@returns {IfBreak}
*/
function ifBreak(breakContents, flatContents = "", options = {}) {
  assertDoc(breakContents);
  if (flatContents !== "") {
    assertDoc(flatContents);
  }

  return {
    type: DOC_TYPE_IF_BREAK,
    breakContents,
    flatContents,
    groupId: options.groupId,
  };
}

export { ifBreak };
