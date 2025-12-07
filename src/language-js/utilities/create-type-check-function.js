import * as assert from "#universal/assert";

/**
@import {Node, Comment, NodeMap, CommentMap} from "../types/estree.js";
*/

/**
@typedef {Node | Comment} NodeOrComment
@typedef {NodeOrComment["type"]} NodeOrCommentTypes
*/

/**
@template {NodeOrCommentTypes[]} InputNodeTypes
@param {InputNodeTypes} typesArray
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

  /**
  @param {Node | Comment | undefined | null} node
  @returns {node is (NodeMap & CommentMap)[InputNodeTypes[number]]}
  */
  return (node) => types.has(node?.type);
}

export default createTypeCheckFunction;
