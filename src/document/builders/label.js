import { assertDoc } from "../utilities/assert-doc.js";
import { DOC_TYPE_LABEL } from "./types.js";

/**
@import {Doc} from "./index.js";
@typedef {0 | 0n | '' | false | null | undefined} Falsy
@typedef {{
  readonly type: DOC_TYPE_LABEL,
  readonly label: any,
  readonly contents: Doc,
}} Label
*/

/**
Mark a doc with an arbitrary truthy value.
This doesn't affect how the doc is printed,
but can be useful for heuristics based on doc introspection.

@template {any} L
@template {Doc} D
@param {L} label If falsy, the `contents` doc is returned as is.
@param {D} contents
@returns {Omit<Label, "label"> & {readonly label: L} | D}
*/
function label(label, contents) {
  assertDoc(contents);

  return label ? { type: DOC_TYPE_LABEL, label, contents } : contents;
}

export { label };
