"use strict";

const {
  builders: { concat, group }
} = require("../doc");

/**
 *     v-for="... in ..."
 *     v-for="... of ..."
 *     v-for="(..., ...) in ..."
 *     v-for="(..., ...) of ..."
 */
function printVueFor(value, textToDoc) {
  const { left, operator, right } = parseVueFor(value);
  return concat([
    group(
      textToDoc(`function _(${left}) {}`, {
        parser: "babylon",
        __isVueForBindingLeft: true
      })
    ),
    " ",
    operator,
    " ",
    textToDoc(right, { parser: "__js_expression" })
  ]);
}

// modified from https://github.com/vuejs/vue/blob/v2.5.17/src/compiler/parser/index.js#L370-L387
function parseVueFor(value) {
  const forAliasRE = /([^]*?)\s+(in|of)\s+([^]*)/;
  const forIteratorRE = /,([^,}\]]*)(?:,([^,}\]]*))?$/;
  const stripParensRE = /^\(|\)$/g;

  const inMatch = value.match(forAliasRE);
  if (!inMatch) {
    return;
  }
  const res = {};
  res.for = inMatch[3].trim();
  const alias = inMatch[1].trim().replace(stripParensRE, "");
  const iteratorMatch = alias.match(forIteratorRE);
  if (iteratorMatch) {
    res.alias = alias.replace(forIteratorRE, "");
    res.iterator1 = iteratorMatch[1].trim();
    if (iteratorMatch[2]) {
      res.iterator2 = iteratorMatch[2].trim();
    }
  } else {
    res.alias = alias;
  }

  return {
    left: `${[res.alias, res.iterator1, res.iterator2]
      .filter(Boolean)
      .join(",")}`,
    operator: inMatch[2],
    right: res.for
  };
}

function printVueSlotScope(value, textToDoc) {
  return textToDoc(`function _(${value}) {}`, {
    parser: "babylon",
    __isVueSlotScope: true
  });
}

module.exports = {
  printVueFor,
  printVueSlotScope
};
