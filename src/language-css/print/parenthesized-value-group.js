import {
  dedent,
  fill,
  group,
  hardline,
  ifBreak,
  indent,
  join,
  line,
  softline,
} from "../../document/builders.js";
import {
  DOC_TYPE_FILL,
  DOC_TYPE_GROUP,
  DOC_TYPE_INDENT,
} from "../../document/constants.js";
import { getDocType } from "../../document/utils.js";
import { assertDocArray } from "../../document/utils/assert-doc.js";
import isNextLineEmpty from "../../utils/is-next-line-empty.js";
import isNonEmptyArray from "../../utils/is-non-empty-array.js";
import { locEnd, locStart } from "../loc.js";
import {
  isConfigurationNode,
  isKeyInValuePairNode,
  isKeyValuePairNode,
  isSCSSMapItemNode,
  isURLFunctionNode,
  isVarFunctionNode,
} from "../utils/index.js";
import { shouldPrintTrailingComma } from "./misc.js";

function hasComma({ node, parent }, options) {
  return Boolean(
    node.source &&
      options.originalText
        .slice(locStart(node), locStart(parent.close))
        .trimEnd()
        .endsWith(","),
  );
}

function printTrailingComma(path, options) {
  if (isVarFunctionNode(path.grandparent) && hasComma(path, options)) {
    return ",";
  }

  if (
    path.node.type !== "value-comment" &&
    !(
      path.node.type === "value-comma_group" &&
      path.node.groups.every((group) => group.type === "value-comment")
    ) &&
    shouldPrintTrailingComma(options) &&
    path.callParent(() => isSCSSMapItemNode(path, options))
  ) {
    return ifBreak(",");
  }

  return "";
}

function printParenthesizedValueGroup(path, options, print) {
  const { node, parent } = path;
  const groupDocs = path.map(
    ({ node }) => (typeof node === "string" ? node : print()),
    "groups",
  );

  if (
    parent &&
    isURLFunctionNode(parent) &&
    (node.groups.length === 1 ||
      (node.groups.length > 0 &&
        node.groups[0].type === "value-comma_group" &&
        node.groups[0].groups.length > 0 &&
        node.groups[0].groups[0].type === "value-word" &&
        node.groups[0].groups[0].value.startsWith("data:")))
  ) {
    return [
      node.open ? print("open") : "",
      join(",", groupDocs),
      node.close ? print("close") : "",
    ];
  }

  if (!node.open) {
    const forceHardLine = shouldBreakList(path);
    assertDocArray(groupDocs);
    const withComma = chunk(join(",", groupDocs), 2);
    const parts = join(forceHardLine ? hardline : line, withComma);
    return indent(
      forceHardLine
        ? [hardline, parts]
        : group([shouldPrecededBySoftline(path) ? softline : "", fill(parts)]),
    );
  }

  const parts = path.map(({ node: child, isLast, index }) => {
    let doc = groupDocs[index];

    // Key/Value pair in open paren already indented
    if (
      isKeyValuePairNode(child) &&
      child.type === "value-comma_group" &&
      child.groups &&
      child.groups[0].type !== "value-paren_group" &&
      child.groups[2]?.type === "value-paren_group" &&
      getDocType(doc) === DOC_TYPE_GROUP &&
      getDocType(doc.contents) === DOC_TYPE_INDENT &&
      getDocType(doc.contents.contents) === DOC_TYPE_FILL
    ) {
      doc = group(dedent(doc));
    }

    const parts = [doc, isLast ? printTrailingComma(path, options) : ","];

    if (
      !isLast &&
      child.type === "value-comma_group" &&
      isNonEmptyArray(child.groups)
    ) {
      let last = child.groups.at(-1);

      // `value-paren_group` does not have location info, but its closing parenthesis does.
      if (!last.source && last.close) {
        last = last.close;
      }

      if (last.source && isNextLineEmpty(options.originalText, locEnd(last))) {
        parts.push(hardline);
      }
    }

    return parts;
  }, "groups");
  const isKey = isKeyInValuePairNode(node, parent);
  const isConfiguration = isConfigurationNode(node, parent);
  const isSCSSMapItem = isSCSSMapItemNode(path, options);
  const shouldBreak = isConfiguration || (isSCSSMapItem && !isKey);
  const shouldDedent = isConfiguration || isKey;

  const doc = group(
    [
      node.open ? print("open") : "",
      indent([softline, join(line, parts)]),
      softline,
      node.close ? print("close") : "",
    ],
    {
      shouldBreak,
    },
  );

  return shouldDedent ? dedent(doc) : doc;
}

function shouldBreakList(path) {
  return path.match(
    (node) =>
      node.type === "value-paren_group" &&
      !node.open &&
      node.groups.some((node) => node.type === "value-comma_group"),
    (node, key) => key === "group" && node.type === "value-value",
    (node, key) => key === "group" && node.type === "value-root",
    (node, key) =>
      key === "value" &&
      ((node.type === "css-decl" && !node.prop.startsWith("--")) ||
        (node.type === "css-atrule" && node.variable)),
  );
}

function shouldPrecededBySoftline(path) {
  return path.match(
    (node) => node.type === "value-paren_group" && !node.open,
    (node, key) => key === "group" && node.type === "value-value",
    (node, key) => key === "group" && node.type === "value-root",
    (node, key) => key === "value" && node.type === "css-decl",
  );
}

/**
 * @template {*} T
 * @param {T[]} array
 * @param {number} size
 * @returns {T[][]}
 */
function chunk(array, size) {
  const result = [];
  for (let i = 0; i < array.length; i += size) {
    result.push(array.slice(i, i + size));
  }
  return result;
}

export { printParenthesizedValueGroup, shouldBreakList };
