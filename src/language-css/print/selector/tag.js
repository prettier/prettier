import { isKeyframeAtRuleKeywords } from "../../utilities/index.js";
import { adjustNumbers } from "../misc.js";

function printTagSelector(path /* , options , print */) {
  const { node } = path;
  const value = node.raws?.value ?? node.value;
  return [
    node.namespace
      ? [
          node.namespace === true
            ? ""
            : (node.raws?.namespace ?? node.namespace).trim(),
          "|",
        ]
      : "",
    path.previous?.type === "selector-nesting"
      ? value
      : adjustNumbers(
          isKeyframeAtRuleKeywords(path, value) ? value.toLowerCase() : value,
        ),
  ];
}

export { printTagSelector };
