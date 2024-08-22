import { ListOptimizedToPrintFill } from "./list-optimized-to-print-fill.js";
import traverseDoc from "./traverse-doc.js";

const checked = process.env.NODE_ENV !== "production" && new WeakSet();
const noop = () => {};
const assertDoc =
  process.env.NODE_ENV === "production"
    ? noop
    : function (doc) {
        traverseDoc(doc, (doc) => {
          if (checked.has(doc)) {
            return false;
          }

          if (typeof doc !== "string") {
            checked.add(doc);
          }
        });
      };

const assertDocArray =
  process.env.NODE_ENV === "production"
    ? noop
    : function (docs, optional = false) {
        if (optional && !docs) {
          return;
        }

        if (docs instanceof ListOptimizedToPrintFill) {
          return;
        }

        if (!Array.isArray(docs)) {
          throw new TypeError("Unexpected doc array.");
        }

        for (const doc of docs) {
          assertDoc(doc);
        }
      };

export { assertDoc, assertDocArray };
