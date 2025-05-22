import { htmlElementAttributes } from "html-element-attributes";

const HTML_ELEMENT_ATTRIBUTES = new Map(
  Object.entries(htmlElementAttributes).map(([tagName, attributes]) => [
    tagName,
    new Set(attributes),
  ]),
);

export default HTML_ELEMENT_ATTRIBUTES;
