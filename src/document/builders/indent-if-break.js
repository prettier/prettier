import { assertDoc } from "../utilities/assert-doc.js";
import { DOC_TYPE_INDENT_IF_BREAK } from "./types.js";

/**
@import {Doc} from "./index.js";
@import {GroupId} from "./group.js";
@typedef {{
  readonly type: DOC_TYPE_INDENT_IF_BREAK,
  readonly contents: Doc,
  readonly groupId: GroupId,
  readonly negate: boolean,
}} IndentIfBreak
@typedef {{groupId: GroupId, negate?: boolean}} IndentIfBreakOptions
*/

/**
Optimized version of `ifBreak(indent(doc), doc, { groupId: ... })`

@param {Doc} contents
@param {IndentIfBreakOptions} options
@returns {IndentIfBreak}
*/
function indentIfBreak(contents, options) {
  assertDoc(contents);

  return {
    type: DOC_TYPE_INDENT_IF_BREAK,
    contents,
    groupId: options.groupId,
    negate: options.negate,
  };
}

export { indentIfBreak };
