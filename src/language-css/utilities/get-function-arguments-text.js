import getValueRoot from "./get-value-root.js";

/**
 * @param {*} node
 * @returns {string}
 */
function getFunctionArgumentsText(node) {
  return getValueRoot(node)
    .text.slice(node.group.open.sourceIndex + 1, node.group.close.sourceIndex)
    .trim();
}

export default getFunctionArgumentsText;
