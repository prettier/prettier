import PostcssValuesParser from "postcss-values-parser/lib/parser.js";
import getFunctionArgumentsText from "../utils/get-function-arguments-text.js";
import getValueRoot from "../utils/get-value-root.js";
import hasSCSSInterpolation from "../utils/has-scss-interpolation.js";
import hasStringOrFunction from "../utils/has-string-or-function.js";
import isSCSSVariable from "../utils/is-scss-variable.js";
import parseSelector from "./parse-selector.js";
import { addTypePrefix } from "./utils.js";

const isClosingParenthesis = (node) =>
  node.type === "paren" && node.value === ")";

function parseValueNode(valueNode, options) {
  const { nodes } = valueNode;
  let parenGroup = {
    open: null,
    close: null,
    groups: [],
    type: "paren_group",
  };
  const parenGroupStack = [parenGroup];
  const rootParenGroup = parenGroup;
  let commaGroup = {
    groups: [],
    type: "comma_group",
  };
  const commaGroupStack = [commaGroup];

  for (let i = 0; i < nodes.length; ++i) {
    const node = nodes[i];

    if (
      options.parser === "scss" &&
      node.type === "number" &&
      node.unit === ".." &&
      node.value.endsWith(".")
    ) {
      // Work around postcss bug parsing `50...` as `50.` with unit `..`
      // Set the unit to `...` to "accidentally" have arbitrary arguments work in the same way that cases where the node already had a unit work.
      // For example, 50px... is parsed as `50` with unit `px...` already by postcss-values-parser.
      node.value = node.value.slice(0, -1);
      node.unit = "...";
    }

    if (node.type === "func" && node.value === "selector") {
      node.group.groups = [
        parseSelector(
          getValueRoot(valueNode).text.slice(
            node.group.open.sourceIndex + 1,
            node.group.close.sourceIndex,
          ),
        ),
      ];
    }

    if (node.type === "func" && node.value === "url") {
      const groups = node.group?.groups ?? [];

      // Create a view with any top-level comma groups flattened.
      let groupList = [];
      for (let i = 0; i < groups.length; i++) {
        const group = groups[i];
        if (group.type === "comma_group") {
          groupList = [...groupList, ...group.groups];
        } else {
          groupList.push(group);
        }
      }

      // Stringify if the value parser can't handle the content.
      if (
        hasSCSSInterpolation(groupList) ||
        (!hasStringOrFunction(groupList) &&
          !isSCSSVariable(groupList[0], options))
      ) {
        node.group.groups = [getFunctionArgumentsText(node)];
      }
    }
    if (node.type === "paren" && node.value === "(") {
      parenGroup = {
        open: node,
        close: null,
        groups: [],
        type: "paren_group",
      };
      parenGroupStack.push(parenGroup);

      commaGroup = {
        groups: [],
        type: "comma_group",
      };
      commaGroupStack.push(commaGroup);
    } else if (isClosingParenthesis(node)) {
      if (commaGroup.groups.length > 0) {
        parenGroup.groups.push(commaGroup);
      }
      parenGroup.close = node;

      /* c8 ignore next 3 */
      if (commaGroupStack.length === 1) {
        throw new Error("Unbalanced parenthesis");
      }

      commaGroupStack.pop();
      commaGroup = commaGroupStack.at(-1);
      commaGroup.groups.push(parenGroup);

      parenGroupStack.pop();
      parenGroup = parenGroupStack.at(-1);
    } else if (node.type === "comma") {
      // Trialing comma
      if (
        i === nodes.length - 3 &&
        nodes[i + 1].type === "comment" &&
        isClosingParenthesis(nodes[i + 2])
      ) {
        continue;
      }

      parenGroup.groups.push(commaGroup);
      commaGroup = {
        groups: [],
        type: "comma_group",
      };
      commaGroupStack[commaGroupStack.length - 1] = commaGroup;
    } else {
      commaGroup.groups.push(node);
    }
  }
  if (commaGroup.groups.length > 0) {
    parenGroup.groups.push(commaGroup);
  }

  return rootParenGroup;
}

function flattenGroups(node) {
  if (
    node.type === "paren_group" &&
    !node.open &&
    !node.close &&
    node.groups.length === 1
  ) {
    return flattenGroups(node.groups[0]);
  }

  if (node.type === "comma_group" && node.groups.length === 1) {
    return flattenGroups(node.groups[0]);
  }

  if (node.type === "paren_group" || node.type === "comma_group") {
    return { ...node, groups: node.groups.map(flattenGroups) };
  }

  return node;
}

function parseNestedValue(node, options) {
  if (node && typeof node === "object") {
    for (const key in node) {
      if (key !== "parent") {
        parseNestedValue(node[key], options);
        if (key === "nodes") {
          node.group = flattenGroups(parseValueNode(node, options));
          delete node[key];
        }
      }
    }
  }
  return node;
}

function parseValue(value, options) {
  // Inline javascript in Less
  if (options.parser === "less" && value.startsWith("~`")) {
    return { type: "value-unknown", value };
  }

  let result = null;

  try {
    result = new PostcssValuesParser(value, { loose: true }).parse();
  } catch {
    return {
      type: "value-unknown",
      value,
    };
  }

  result.text = value;

  const parsedResult = parseNestedValue(result, options);

  return addTypePrefix(parsedResult, "value-", /^selector-/u);
}

export default parseValue;
