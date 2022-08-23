import { DOC_TYPE_STRING, DOC_TYPE_ARRAY } from "../constants.js";

function getDocType(doc) {
  if (typeof doc === "string") {
    return DOC_TYPE_STRING;
  }

  if (Array.isArray(doc)) {
    return DOC_TYPE_ARRAY;
  }

  return doc?.type;
}

export default getDocType;
