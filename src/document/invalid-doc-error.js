import getLast from "../utils/get-last.js";
import {
  DOC_TYPE_STRING,
  DOC_TYPE_CONCAT,
  DOC_TYPE_CURSOR,
  DOC_TYPE_INDENT,
  DOC_TYPE_ALIGN,
  DOC_TYPE_TRIM,
  DOC_TYPE_GROUP,
  DOC_TYPE_FILL,
  DOC_TYPE_IF_BREAK,
  DOC_TYPE_INDENT_IF_BREAK,
  DOC_TYPE_LINE_SUFFIX,
  DOC_TYPE_LINE_SUFFIX_BOUNDARY,
  DOC_TYPE_LINE,
  DOC_TYPE_LABEL,
  DOC_TYPE_BREAK_PARENT,
} from "./constants.js";
import { getDocType } from "./utils.js";

const VALID_OBJECT_DOC_TYPE_VALUES = [
  DOC_TYPE_CONCAT,
  DOC_TYPE_CURSOR,
  DOC_TYPE_INDENT,
  DOC_TYPE_ALIGN,
  DOC_TYPE_TRIM,
  DOC_TYPE_GROUP,
  DOC_TYPE_FILL,
  DOC_TYPE_IF_BREAK,
  DOC_TYPE_INDENT_IF_BREAK,
  DOC_TYPE_LINE_SUFFIX,
  DOC_TYPE_LINE_SUFFIX_BOUNDARY,
  DOC_TYPE_LINE,
  DOC_TYPE_LABEL,
  DOC_TYPE_BREAK_PARENT,
];

// TODO: Use `new Intl.ListFormat("en-US", { type: "disjunction" }).format()` when we drop support for iOS 12.5
// Only works for array with more than 1 elements
const disjunctionListFormat = (list) =>
  [...list.slice(0, -1), `or ${getLast(list)}`].join(", ");

function getDocErrorMessage(doc) {
  const type = doc === null ? null : typeof doc;
  if (type !== "string" && type !== "object") {
    return `Unexpected doc '${type}', \nExpected it to be 'string' or 'object'.`;
  }

  const docType = getDocType(doc);
  if (
    docType === DOC_TYPE_STRING ||
    docType === DOC_TYPE_CONCAT ||
    VALID_OBJECT_DOC_TYPE_VALUES.includes(docType)
  ) {
    throw new Error("doc is valid.");
  }

  const EXPECTED_TYPE_VALUES = disjunctionListFormat(
    VALID_OBJECT_DOC_TYPE_VALUES.map((type) => `'${type}'`)
  );

  return `Unexpected doc.type '${docType}'.\nExpected it to be ${EXPECTED_TYPE_VALUES}.`;
}

class InvalidDocError extends Error {
  name = "InvalidDocError";

  constructor(doc) {
    super(getDocErrorMessage(doc));
    this.doc = doc;
  }
}

export default InvalidDocError;
