import {
  DOC_TYPE_BREAK_PARENT,
  DOC_TYPE_GROUP,
  DOC_TYPE_LINE,
  findInDoc,
} from "../../document/index.js";

// Groups that only break because `objectWrap: "preserve"` found a line break
// after the opening brace. Prettier can introduce that line break itself, so
// layout decisions based on these groups are not stable across runs.
const preservedObjectWraps = new WeakSet();

function markPreservedObjectWrap(doc) {
  preservedObjectWraps.add(doc);
}

function willBreakWithoutPreservedObjectWrap(doc) {
  return findInDoc(
    doc,
    (doc) => {
      if (doc.type === DOC_TYPE_GROUP && doc.break) {
        return preservedObjectWraps.has(doc) ? undefined : true;
      }
      if (doc.type === DOC_TYPE_LINE && doc.hard) {
        return true;
      }
      if (doc.type === DOC_TYPE_BREAK_PARENT) {
        return true;
      }
    },
    false,
  );
}

export { markPreservedObjectWrap, willBreakWithoutPreservedObjectWrap };
