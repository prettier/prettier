"use strict";

const {
  builders: { group },
} = require("../document");

/**
 *     v-for="... in ..."
 *     v-for="... of ..."
 *     v-for="(..., ...) in ..."
 *     v-for="(..., ...) of ..."
 */
function printVueFor(value, textToDoc) {
  const { left, operator, right } = parseVueFor(value);
  return [
    group(
      textToDoc(`function _(${left}) {}`, {
        parser: "babel",
        __isVueForBindingLeft: true,
      })
    ),
    " ",
    operator,
    " ",
    textToDoc(
      right,
      { parser: "__js_expression" },
      { stripTrailingHardline: true }
    ),
  ];
}

// modified from https://github.com/vuejs/vue/blob/v2.5.17/src/compiler/parser/index.js#L370-L387
function parseVueFor(value) {
  const forAliasRE = /(?<left>[^]*?)\s+(?<operator>in|of)\s+(?<right>[^]*)/;
  const forIteratorRE = /,(?<iterator1>[^,\]}]*)(?:,(?<iterator2>[^,\]}]*))?$/;
  const stripParensRE = /^\(|\)$/g;

  const inMatch = value.match(forAliasRE);
  if (!inMatch) {
    return;
  }
  const res = {};
  res.for = inMatch.groups.right.trim();
  const alias = inMatch.groups.left.trim().replace(stripParensRE, "");

  const iteratorMatch = alias.match(forIteratorRE);
  if (iteratorMatch) {
    res.alias = alias.replace(forIteratorRE, "");
    res.iterator1 = iteratorMatch.groups.iterator1.trim();
    if (iteratorMatch.groups.iterator2) {
      res.iterator2 = iteratorMatch.groups.iterator2.trim();
    }
  } else {
    res.alias = alias;
  }

  return {
    left: `${[res.alias, res.iterator1, res.iterator2]
      .filter(Boolean)
      .join(",")}`,
    operator: inMatch.groups.operator,
    right: res.for,
  };
}

function printVueBindings(value, textToDoc) {
  return textToDoc(`function _(${value}) {}`, {
    parser: "babel",
    __isVueBindings: true,
  });
}

function isVueEventBindingExpression(eventBindingValue) {
  // https://github.com/vuejs/vue/blob/v2.5.17/src/compiler/codegen/events.js#L3-L4
  // arrow function or anonymous function
  const fnExpRE = /^(?:[\w$]+|\([^)]*?\))\s*=>|^function\s*\(/;
  // simple member expression chain (a, a.b, a['b'], a["b"], a[0], a[b])
  const simplePathRE = /^[$A-Z_a-z][\w$]*(?:\.[$A-Z_a-z][\w$]*|\['[^']*?']|\["[^"]*?"]|\[\d+]|\[[$A-Z_a-z][\w$]*])*$/;

  // https://github.com/vuejs/vue/blob/v2.5.17/src/compiler/helpers.js#L104
  const value = eventBindingValue.trim();

  return fnExpRE.test(value) || simplePathRE.test(value);
}

module.exports = {
  isVueEventBindingExpression,
  printVueFor,
  printVueBindings,
};
