import { elementAttributes, globalAttributes } from "@prettier/html-attributes";

const ELEMENT_ATTRIBUTES = new Map(
  Object.entries(elementAttributes).map(([tagName, attributes]) => [
    tagName,
    new Set(attributes),
  ]),
);

const GLOBAL_ATTRIBUTES = new Set(globalAttributes);

export { ELEMENT_ATTRIBUTES, GLOBAL_ATTRIBUTES };
