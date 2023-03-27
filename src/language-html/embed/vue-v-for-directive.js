import { group } from "../../document/builders.js";
import { getUnescapedAttributeValue } from "../utils/index.js";
import isVueSfcWithTypescriptScript from "../utils/is-vue-sfc-with-typescript-script.js";
import { formatAttributeValue } from "./utils.js";

/**
 * @typedef {import("../document/builders.js").Doc} Doc
 */

/**
 *     v-for="... in ..."
 *     v-for="... of ..."
 *     v-for="(..., ...) in ..."
 *     v-for="(..., ...) of ..."
 *
 * @param {*} options
 * @returns {Promise<Doc>}
 */
async function printVueVForDirective(value, textToDoc, { parseWithTs }) {
  const { left, operator, right } = parseVueVForDirective(value);
  return [
    group(
      await formatAttributeValue(
        `function _(${left}) {}`,
        {
          parser: parseWithTs ? "babel-ts" : "babel",
          __isVueForBindingLeft: true,
        },
        textToDoc
      )
    ),
    " ",
    operator,
    " ",
    await formatAttributeValue(
      right,
      {
        parser: parseWithTs ? "__ts_expression" : "__js_expression",
      },
      textToDoc
    ),
  ];
}

// modified from https://github.com/vuejs/vue/blob/v2.5.17/src/compiler/parser/index.js#L370-L387
function parseVueVForDirective(value) {
  const forAliasRE = /(.*?)\s+(in|of)\s+(.*)/s;
  const forIteratorRE = /,([^,\]}]*)(?:,([^,\]}]*))?$/;
  const stripParensRE = /^\(|\)$/g;

  const inMatch = value.match(forAliasRE);
  if (!inMatch) {
    return;
  }

  const res = {};
  res.for = inMatch[3].trim();
  if (!res.for) {
    return;
  }

  const alias = inMatch[1].trim().replaceAll(stripParensRE, "");
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

  const left = [res.alias, res.iterator1, res.iterator2];
  if (
    left.some(
      (part, index) =>
        !part && (index === 0 || left.slice(index + 1).some(Boolean))
    )
  ) {
    return;
  }

  return {
    left: left.filter(Boolean).join(","),
    operator: inMatch[2],
    right: res.for,
  };
}

export { printVueVForDirective };
