import { isKeyframeAtRuleKeywords } from "../../utilities/index.js";
import { adjustNumbers } from "../misc.js";

function printTagSelector(path /* , options , print */) {
  const { node } = path;
  return [
    node.namespace
      ? [node.namespace === true ? "" : node.namespace.trim(), "|"]
      : "",
    path.previous?.type === "selector-nesting"
      ? node.value
      : adjustNumbers(
          isKeyframeAtRuleKeywords(path, node.value)
            ? node.value.toLowerCase()
            : node.value,
        ),
  ];
}

export { printTagSelector };
