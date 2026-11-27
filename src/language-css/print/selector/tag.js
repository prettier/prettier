import { isKeyframeAtRuleKeywords } from "../../utilities/index.js";
import { adjustNumbers } from "../misc.js";
import { printSelectorNamespace } from "./namespace.js";

function printTagSelector(path /* , options , print */) {
  const { node } = path;
  const value = node.raws?.value ?? node.value;
  return [
    printSelectorNamespace(node),
    path.previous?.type === "selector-nesting"
      ? value
      : adjustNumbers(
          isKeyframeAtRuleKeywords(path, value) ? value.toLowerCase() : value,
        ),
  ];
}

export { printTagSelector };
