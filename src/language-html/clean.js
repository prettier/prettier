import { isFrontMatterNode } from "../common/util.js";

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

export default clean;
