import { printSelectorNamespace } from "./namespace.js";

function printUniversalSelector(path /* , options , print */) {
  const { node } = path;

  return [printSelectorNamespace(node), node.value];
}

export { printUniversalSelector };
