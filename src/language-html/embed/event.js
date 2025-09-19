import { htmlEventAttributes } from "html-event-attributes";
import { getUnescapedAttributeValue } from "../utils/index.js";
import { formatAttributeValue, shouldHugJsExpression } from "./utils.js";

export default function printEventAttribute(path, options) {
  const { node } = path;

  if (!htmlEventAttributes.includes(node.fullName) || options.parentParser) {
    return;
  }

  const text = getUnescapedAttributeValue(path.node).trim();

  if (!text.includes("{{")) {
    return async (textToDoc) => {
      try {
        return await formatAttributeValue(
          text,
          textToDoc,
          { parser: "__js_expression" },
          shouldHugJsExpression,
        );
      } catch (error) {
        // @ts-expect-error -- expected
        if (error.cause?.code !== "BABEL_PARSER_SYNTAX_ERROR") {
          throw error;
        }
      }

      return formatAttributeValue(
        text,
        textToDoc,
        { parser: "__html_event_binding" },
        shouldHugJsExpression,
      );
    };
  }
}
