import { assertDoc, assertDocArray } from "../utilities/assert-doc.js";
import { DOC_TYPE_GROUP } from "./types.js";

/**
@import {Doc} from "./index.js";
@typedef {symbol} GroupId
@typedef {{
  readonly type: DOC_TYPE_GROUP,
  readonly id: GroupId,
  readonly contents: Doc,
  readonly break: boolean,
  readonly expandedStates: readonly Doc[],
}} Group
@typedef {{id?: GroupId, shouldBreak?: boolean, expandedStates?: Doc[]}} GroupOptions
*/

/**
@param {Doc} contents
@param {GroupOptions} [options]
@returns {Group}
*/
function group(contents, options = {}) {
  assertDoc(contents);
  assertDocArray(options.expandedStates, /* optional */ true);

  return {
    type: DOC_TYPE_GROUP,
    id: options.id,
    contents,
    break: Boolean(options.shouldBreak),
    expandedStates: options.expandedStates,
  };
}

/**
@param {Doc[]} states
@param {Omit<GroupOptions, "expandedStates">} [options]
@returns Doc
*/
function conditionalGroup(states, options) {
  return group(states[0], { ...options, expandedStates: states });
}

export { conditionalGroup, group };
