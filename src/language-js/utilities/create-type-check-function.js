import * as assert from "#universal/assert";

/**
@import {Node, Comment, Nodes, Comments} from "../types/estree.js";
*/

/**
@template {(Node | Comment)["type"][]} InputNodeTypes
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
  @returns {
    node is InputNodeTypes extends Node["type"][]
      ? Nodes[InputNodeTypes[number]]
      : Comments[InputNodeTypes[number]]
  }
  */
  return (node) => types.has(node?.type);
}

export default createTypeCheckFunction;
