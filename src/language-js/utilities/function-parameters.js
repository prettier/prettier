const functionParametersCache = new WeakMap();
function getFunctionParameters(node) {
  if (functionParametersCache.has(node)) {
    return functionParametersCache.get(node);
  }
  const parameters = [];
  if (node.this) {
    parameters.push(node.this);
  }

  parameters.push(...node.params);

  if (node.rest) {
    parameters.push(node.rest);
  }
  functionParametersCache.set(node, parameters);
  return parameters;
}

function iterateFunctionParametersPath(path, iteratee) {
  const { node } = path;
  let index = 0;
  const callback = () => iteratee(path, index++);
  if (node.this) {
    path.call(callback, "this");
  }

  path.each(callback, "params");

  if (node.rest) {
    path.call(callback, "rest");
  }
}

function hasRestParameter(node) {
  if (node.rest) {
    return true;
  }
  const parameters = getFunctionParameters(node);
  return parameters.at(-1)?.type === "RestElement";
}

export {
  getFunctionParameters,
  hasRestParameter,
  iterateFunctionParametersPath,
};
