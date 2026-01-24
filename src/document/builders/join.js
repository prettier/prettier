import { assertDoc, assertDocArray } from "../utilities/assert-doc.js";

/**
@import {Doc} from "./index.js";
*/

/**
@param {Doc} separator
@param {Doc[]} docs
@returns {Doc[]}
*/
function join(separator, docs) {
  assertDoc(separator);
  assertDocArray(docs);

  const parts = [];

  for (let i = 0; i < docs.length; i++) {
    if (i !== 0) {
      parts.push(separator);
    }

    parts.push(docs[i]);
  }

  return parts;
}

export { join };
