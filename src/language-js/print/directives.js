"use strict";

const { isNextLineEmpty } = require("../../common/util");
const {
  builders: { concat, hardline },
} = require("../../document");
const { locEnd } = require("../loc");

function printDirectives(path, options, print) {
  const lastDirectiveIndex = path.getValue().directives.length - 1;
  const parts = [];
  path.each((childPath, index) => {
    parts.push(print(childPath));
    if (index < lastDirectiveIndex) {
      parts.push(hardline);

      if (isNextLineEmpty(options.originalText, childPath.getValue(), locEnd)) {
        parts.push(hardline);
      }
    }
  }, "directives");

  return concat(parts);
}

function hasDirectives(node) {
  return Array.isArray(node.directives) && node.directives.length > 0;
}

module.exports = { hasDirectives, printDirectives };
