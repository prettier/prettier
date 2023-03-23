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
import { shouldPrintComma } from "./misc.js";

function printParenthesizedValueGroup(path, options, print) {
  const { node } = path;
  const parentNode = path.parent;
  const printedGroups = path.map(
    ({ node }) => (typeof node === "string" ? node : print()),
    "groups"
  );

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
    const forceHardLine = shouldBreakList(path);
    const parts = join([",", forceHardLine ? hardline : line], printedGroups);
    return indent(forceHardLine ? [hardline, parts] : group(fill(parts)));
  }

  const isSCSSMapItem = isSCSSMapItemNode(path, options);

  const lastItem = node.groups.at(-1);
  const isLastItemComment = lastItem?.type === "value-comment";
  const isKey = isKeyInValuePairNode(node, parentNode);
  const isConfiguration = isConfigurationNode(node, parentNode);
  const isVarFunction = isVarFunctionNode(parentNode);

  const shouldBreak = isConfiguration || (isSCSSMapItem && !isKey);
  const shouldDedent = isConfiguration || isKey;

  const printed = group(
    [
      node.open ? print("open") : "",
      indent([
        softline,
        join(
          [line],
          path.map(({ node: child, isLast, index }) => {
            const hasComma = () =>
              Boolean(
                child.source &&
                  options.originalText
                    .slice(locStart(child), locStart(node.close))
                    .trimEnd()
                    .endsWith(",")
              );
            const shouldPrintComma = !isLast || (isVarFunction && hasComma());
            let printed = [printedGroups[index], shouldPrintComma ? "," : ""];

            // Key/Value pair in open paren already indented
            if (
              isKeyValuePairNode(child) &&
              child.type === "value-comma_group" &&
              child.groups &&
              child.groups[0].type !== "value-paren_group" &&
              child.groups[2]?.type === "value-paren_group"
            ) {
              const parts = getDocParts(printed[0].contents.contents);
              parts[1] = group(parts[1]);
              printed = [group(dedent(printed))];
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
                printed.push(hardline);
              }
            }

            return printed;
          }, "groups")
        ),
      ]),
      ifBreak(
        !isLastItemComment &&
          options.parser === "scss" &&
          isSCSSMapItem &&
          shouldPrintComma(options)
          ? ","
          : ""
      ),
      softline,
      node.close ? print("close") : "",
    ],
    {
      shouldBreak,
    }
  );

  return shouldDedent ? dedent(printed) : printed;
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
        (node.type === "css-atrule" && node.variable))
  );
}

export { printParenthesizedValueGroup, shouldBreakList };
