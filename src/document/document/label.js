import { assertDoc } from "./assert-doc.js";
import { DOC_TYPE_LABEL } from "./types.js";

/**
@import {Doc} from "./index.js";
@typedef {<Label extends object = any>{
  readonly type: DOC_TYPE_LABEL,
  readonly label: Label,
  readonly contents: Doc,
}} Label
*/

/**
Mark a doc with an arbitrary truthy value.
This doesn't affect how the doc is printed,
but can be useful for heuristics based on doc introspection.

@template {L} Label
@param {L} label If falsy, the `contents` doc is returned as is.
@param {Doc} contents
@returns {Label<L>}
*/
function label(label, contents) {
  assertDoc(contents);

  return label ? { type: DOC_TYPE_LABEL, label, contents } : contents;
}

export { label };
