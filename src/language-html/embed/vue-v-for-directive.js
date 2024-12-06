import { group } from "../../document/builders.js";
import { getUnescapedAttributeValue } from "../utils/index.js";
import isVueSfcWithTypescriptScript from "../utils/is-vue-sfc-with-typescript-script.js";
import { formatAttributeValue } from "./utils.js";

/**
 * @import {Doc} from "../../document/builders.js"
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
async function printVueVForDirective(textToDoc, print, path, options) {
  const value = getUnescapedAttributeValue(path.node);
  const { left, operator, right } = parseVueVForDirective(value);
  const parseWithTs = isVueSfcWithTypescriptScript(path, options);
  return [
    group(
      await formatAttributeValue(`function _(${left}) {}`, textToDoc, {
        parser: parseWithTs ? "babel-ts" : "babel",
        __isVueForBindingLeft: true,
      }),
    ),
    " ",
    operator,
    " ",
    await formatAttributeValue(right, textToDoc, {
      parser: parseWithTs ? "__ts_expression" : "__js_expression",
    }),
  ];
}

// modified from https://github.com/vuejs/vue/blob/v2.5.17/src/compiler/parser/index.js#L370-L387
function parseVueVForDirective(value) {
  const forAliasRE = /(.*?)\s+(in|of)\s+(.*)/su;
  const forIteratorRE = /,([^,\]}]*)(?:,([^,\]}]*))?$/u;
  const stripParensRE = /^\(|\)$/gu;

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
        !part && (index === 0 || left.slice(index + 1).some(Boolean)),
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
