import { isFrontMatterNode } from "../common/util.js";
import { nonTraversableKeysForClean } from "./non-traversable-keys.js";

function clean(ast, newNode) {
  if (ast.type === "text" || ast.type === "comment") {
    return null;
  }

  // may be formatted by multiparser
  if (isFrontMatterNode(ast) || ast.type === "yaml" || ast.type === "toml") {
    return null;
  }

  if (ast.type === "attribute") {
    delete newNode.value;
  }

  if (ast.type === "docType") {
    delete newNode.value;
  }
}

clean.nonTraversableKeys = nonTraversableKeysForClean;

export default clean;
