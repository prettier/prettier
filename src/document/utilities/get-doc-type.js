import {
  DOC_TYPE_ARRAY,
  DOC_TYPE_STRING,
  VALID_OBJECT_DOC_TYPES,
} from "../builders/types.js";

/**
@import {Doc} from "../builders/index.js";
*/

/**
@template {unknown} InputDoc
@param {InputDoc} doc
@returns {
  InputDoc extends string ? DOC_TYPE_STRING
  : InputDoc extends readonly Doc[] ? DOC_TYPE_ARRAY
  : InputDoc extends Doc ? InputDoc["type"]
  : void
}
*/
function getDocType(doc) {
  if (typeof doc === "string") {
    // @ts-expect-error -- TS throws [TS2322], but actually works
    return DOC_TYPE_STRING;
  }

  if (Array.isArray(doc)) {
    // @ts-expect-error -- TS throws [TS2322], but actually works
    return DOC_TYPE_ARRAY;
  }

  if (!doc) {
    return;
  }

  // @ts-expect-error -- Safe
  const { type } = doc;

  if (VALID_OBJECT_DOC_TYPES.has(type)) {
    return type;
  }
}

export default getDocType;
