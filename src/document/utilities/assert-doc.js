import noop from "../../utilities/noop.js";
import {
  DOC_TYPE_IF_BREAK,
  DOC_TYPE_LINE,
  DOC_TYPE_STRING,
} from "../builders/types.js";
import { isEmptyDoc } from "../utilities/index.js";
import getDocType from "./get-doc-type.js";
import traverseDoc from "./traverse-doc.js";

/**
@import {Doc} from "../builders/index.js";
*/

const checked = process.env.NODE_ENV !== "production" && new WeakSet();
const assertDoc =
  process.env.NODE_ENV === "production"
    ? noop
    : /**
      @param {Doc} doc
      */
      function (doc) {
        traverseDoc(doc, (doc) => {
          if (typeof doc === "string" || checked.has(doc)) {
            return false;
          }

          checked.add(doc);
        });
      };

const assertDocArray =
  process.env.NODE_ENV === "production"
    ? noop
    : /**
      @param {readonly Doc[]} docs
      @param {boolean} [optional = false]
      */
      function (docs, optional = false) {
        if (optional && !docs) {
          return;
        }

        if (!Array.isArray(docs)) {
          throw new TypeError("Unexpected doc array.");
        }

        for (const doc of docs) {
          assertDoc(doc);
        }
      };

const assertDocFillParts =
  process.env.NODE_ENV === "production"
    ? noop
    : /**
      @param {readonly Doc[]} parts
      */
      function (parts) {
        assertDocArray(parts);
        if (parts.length > 1 && isEmptyDoc(parts.at(-1))) {
          // stripTrailingHardline can transform trailing hardline into empty string.
          // The trailing empty string is not a problem even if it's a line element.
          parts = parts.slice(0, -1);
        }
        for (const [i, doc] of parts.entries()) {
          if (i % 2 === 1 && !isValidSeparator(doc)) {
            const type = getDocType(doc);
            throw new Error(
              `Unexpected non-line-break doc at ${i}. Doc type is ${type}.`,
            );
          }
        }
      };

const assertAlignType =
  process.env.NODE_ENV === "production"
    ? noop
    : function (alignType) {
        if (
          !(
            typeof alignType === "number" ||
            typeof alignType === "string" ||
            alignType?.type === "root"
          )
        ) {
          throw new TypeError(`Invalid alignType '${alignType}'.`);
        }
      };

/**
 * @param {Doc} doc
 * @returns {boolean}
 */
function isValidSeparator(doc) {
  let hasLine = false;
  let hasUnexpectedString = false;

  /**
  @param {Doc} doc
  */
  function rec(doc) {
    switch (getDocType(doc)) {
      case DOC_TYPE_LINE:
        hasLine = true;
        return;
      case DOC_TYPE_STRING:
        if (doc === "{' '}" || doc === '{" "}' || doc === " ") {
          // As of now, we can include `{' '}` in line part of `fill()`.
          // This sometimes causes overflows https://github.com/prettier/prettier/issues/2553
          // We don't have a good way to handle this case.
          return;
        }
        hasUnexpectedString = true;
        return;
      case DOC_TYPE_IF_BREAK:
        // @ts-expect-error -- Safe
        traverseDoc(doc.breakContents, rec);
        return false;
      default:
    }
  }

  traverseDoc(doc, rec);

  return hasLine && !hasUnexpectedString;
}

export { assertAlignType, assertDoc, assertDocArray, assertDocFillParts };
