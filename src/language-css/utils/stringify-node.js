"use strict";

function stringifyNode(node) {
  if (node.groups) {
    const open = node.open?.value || "";
    const groups = node.groups
      .map((currentValue) => stringifyNode(currentValue))
      .join(node.groups[0]?.type === "comma_group" ? "," : "");
    const close = node.close?.value || "";

    return open + groups + close;
  }

  const before = node.raws?.before || "";
  const quote = node.raws?.quote || "";
  const atword = node.type === "atword" ? "@" : "";
  const value = node.value || "";
  const unit = node.unit || "";
  const group = node.group ? stringifyNode(node.group) : "";
  const after = node.raws?.after || "";

  return before + quote + atword + value + quote + unit + group + after;
}

module.exports = stringifyNode;
