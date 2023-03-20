import isNextLineEmpty from "../../utils/is-next-line-empty.js";
import isNonEmptyArray from "../../utils/is-non-empty-array.js";
import {
  join,
  line,
  hardline,
  softline,
  group,
  fill,
  indent,
  dedent,
  ifBreak,
} from "../../document/builders.js";
import { getDocParts } from "../../document/utils.js";
import {
  isURLFunctionNode,
  isKeyValuePairNode,
  isKeyInValuePairNode,
  isSCSSMapItemNode,
  isConfigurationNode,
  isVarFunctionNode,
} from "../utils/index.js";
import { locStart, locEnd } from "../loc.js";
import { shouldPrintTrailingComma } from "./misc.js";

function hasComma({ node, parent }, options) {
  return Boolean(
    node.source &&
      options.originalText
        .slice(locStart(node), locStart(parent.close))
        .trimEnd()
        .endsWith(",")
  );
}

function printParenthesizedValueGroup(path, options, print) {
  const { node } = path;
  const parentNode = path.parent;
  const printedGroups = path.map(() => {
    const child = path.node;
    return typeof child === "string" ? child : print();
  }, "groups");

  if (
    parentNode &&
    isURLFunctionNode(parentNode) &&
    (node.groups.length === 1 ||
      (node.groups.length > 0 &&
        node.groups[0].type === "value-comma_group" &&
        node.groups[0].groups.length > 0 &&
        node.groups[0].groups[0].type === "value-word" &&
        node.groups[0].groups[0].value.startsWith("data:")))
  ) {
    return [
      node.open ? print("open") : "",
      join(",", printedGroups),
      node.close ? print("close") : "",
    ];
  }

  if (!node.open) {
    return group(indent(fill(join([",", line], printedGroups))));
  }

  const isSCSSMapItem = isSCSSMapItemNode(path, options);

  const lastItem = node.groups.at(-1);
  const isLastItemComment = lastItem?.type === "value-comment";
  const isKey = isKeyInValuePairNode(node, parentNode);
  const isConfiguration = isConfigurationNode(node, parentNode);
  const isVarFunction = isVarFunctionNode(parentNode);

  const shouldBreak = isConfiguration || (isSCSSMapItem && !isKey);
  const shouldDedent = isConfiguration || isKey;

  const groupsDoc = join(
    [line],
    path.map(({ node: child, isLast, index }) => {
      let doc = printedGroups[index];

      // Key/Value pair in open paren already indented
      if (
        isKeyValuePairNode(child) &&
        child.type === "value-comma_group" &&
        child.groups &&
        child.groups[0].type !== "value-paren_group" &&
        child.groups[2]?.type === "value-paren_group"
      ) {
        const parts = getDocParts(doc.contents.contents);
        parts[1] = group(parts[1]);
        doc = [group(dedent(doc))];
      }

      const parts = [doc];
      if (!isLast || (isVarFunction && hasComma(path, options))) {
        parts.push(",");
      }

      if (
        isLast &&
        !isLastItemComment &&
        options.parser === "scss" &&
        isSCSSMapItem &&
        shouldPrintTrailingComma(options)
      ) {
        parts.push(ifBreak(","));
      }

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

        if (
          last.source &&
          isNextLineEmpty(options.originalText, locEnd(last))
        ) {
          parts.push(hardline);
        }
      }

      return parts;
    }, "groups")
  );

  const printed = group(
    [
      node.open ? print("open") : "",
      indent([softline, groupsDoc]),
      softline,
      node.close ? print("close") : "",
    ],
    {
      shouldBreak,
    }
  );

  return shouldDedent ? dedent(printed) : printed;
}

export default printParenthesizedValueGroup;
