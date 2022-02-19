"use strict";

function stringifyNode(node) {
  if (node.groups) {
    const open = node.open && node.open.value ? node.open.value : "";
    const groups = node.groups.reduce(
      (previousValue, currentValue, index) =>
        previousValue +
        stringifyNode(currentValue) +
        (node.groups[0].type === "comma_group" &&
        index !== node.groups.length - 1
          ? ","
          : ""),
      ""
    );
    const close = node.close && node.close.value ? node.close.value : "";

    return open + groups + close;
  }

  const before = node.raws && node.raws.before ? node.raws.before : "";
  const quote = node.raws && node.raws.quote ? node.raws.quote : "";
  const atword = node.type === "atword" ? "@" : "";
  const value = node.value ? node.value : "";
  const unit = node.unit ? node.unit : "";
  const group = node.group ? stringifyNode(node.group) : "";
  const after = node.raws && node.raws.after ? node.raws.after : "";

  return before + quote + atword + value + quote + unit + group + after;
}

module.exports = stringifyNode;
