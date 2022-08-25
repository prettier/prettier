import getLast from "../utils/get-last.js";
import { VALID_OBJECT_DOC_TYPES } from "./constants.js";
import getDocType from "./utils/get-doc-type.js";

// TODO: Use `new Intl.ListFormat("en-US", { type: "disjunction" }).format()` when we drop support for iOS 12.5
// Only works for array with more than 1 elements
const disjunctionListFormat = (list) =>
  [...list.slice(0, -1), `or ${getLast(list)}`].join(", ");

function getDocErrorMessage(doc) {
  const type = doc === null ? null : typeof doc;
  if (type !== "string" && type !== "object") {
    return `Unexpected doc '${type}', \nExpected it to be 'string' or 'object'.`;
  }

  /* istanbul ignore next */
  if (getDocType(doc)) {
    throw new Error("doc is valid.");
  }

  // eslint-disable-next-line prettier-internal-rules/no-unnecessary-ast-path-call
  const objectType = Object.prototype.toString.call(doc);
  if (objectType !== "[object Object]") {
    return `Unexpected doc '${objectType}'.`;
  }

  const EXPECTED_TYPE_VALUES = disjunctionListFormat(
    [...VALID_OBJECT_DOC_TYPES].map((type) => `'${type}'`)
  );

  return `Unexpected doc.type '${doc.type}'.\nExpected it to be ${EXPECTED_TYPE_VALUES}.`;
}

class InvalidDocError extends Error {
  name = "InvalidDocError";

  constructor(doc) {
    super(getDocErrorMessage(doc));
    this.doc = doc;
  }
}

export default InvalidDocError;
