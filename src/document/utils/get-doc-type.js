import {
  DOC_TYPE_ARRAY,
  DOC_TYPE_STRING,
  VALID_OBJECT_DOC_TYPES,
} from "../constants.js";

function getDocType(doc) {
  if (typeof doc === "string") {
    return DOC_TYPE_STRING;
  }

  if (Array.isArray(doc)) {
    return DOC_TYPE_ARRAY;
  }

  if (!doc) {
    return;
  }

  const { type } = doc;

  if (VALID_OBJECT_DOC_TYPES.has(type)) {
    return type;
  }
}

export default getDocType;
