import * as assert from "#universal/assert";

/**
@import {Node, Comment, Nodes, Comments} from "../types/estree.js";
*/

/**
@template {(Node | Comment)["type"][]} InputNodeTypes
@param {InputNodeTypes} typesArray
@returns {
(node: Node | Comment) => node is
  InputNodeTypes extends Node["type"][] ?
  Nodes[InputNodeTypes[number]] :
  Comments[InputNodeTypes[number]]
}
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
