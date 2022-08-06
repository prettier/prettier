function massageAST(ast, options, parent) {
  if (Array.isArray(ast)) {
    return ast.map((e) => massageAST(e, options, parent)).filter(Boolean);
  }

  if (!ast || typeof ast !== "object") {
    return ast;
  }

  const cleanFunction = options.printer.massageAstNode;

  const ignoredProperties = new Set([
    ...(options.printer.ignoredProperties ?? []),
    ...(cleanFunction?.ignoredProperties ?? []),
  ]);

  const newObj = {};
  for (const [key, value] of Object.entries(ast)) {
    if (!ignoredProperties.has(key) && typeof value !== "function") {
      newObj[key] = massageAST(value, options, ast);
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

export default massageAST;
