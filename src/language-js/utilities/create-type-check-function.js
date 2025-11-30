import * as assert from "#universal/assert";

/** @import {Node, Comment} from "../types/estree.js" */

/**
 * @param {string[]} typesArray
 * @returns {(node: Node | Comment) => Boolean}
 */
function createTypeCheckFunction(typesArray) {
  const types = new Set(typesArray);

  if (process.env.NODE_ENV !== "production") {
    assert.equal(
      typesArray.length,
      types.size,
      "'typesArray' should be unique.",
    );
  }

  return (node) => types.has(node?.type);
}

export default createTypeCheckFunction;
