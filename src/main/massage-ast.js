"use strict";

function massageAST(ast, options, parent) {
  if (Array.isArray(ast)) {
    return ast.map((e) => massageAST(e, options, parent)).filter(Boolean);
  }

  if (!ast || typeof ast !== "object") {
    return ast;
  }

  const cleanFunction = options.printer.massageAstNode;
  let ignoredProperties;
  if (cleanFunction && cleanFunction.ignoredProperties) {
    ignoredProperties = cleanFunction.ignoredProperties;
  } else {
    ignoredProperties = new Set();
  }

  const newObj = {};
  for (const key of Object.keys(ast)) {
    if (!ignoredProperties.has(key) && typeof ast[key] !== "function") {
      newObj[key] = massageAST(ast[key], options, ast);
    }
  }

  if (cleanFunction) {
    const result = cleanFunction(ast, newObj, parent);
    if (result === null) {
      return;
    }
    if (result) {
      return result;
    }
  }

  return newObj;
}

module.exports = massageAST;
