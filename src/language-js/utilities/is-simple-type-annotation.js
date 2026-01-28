import { createTypeCheckFunction } from "./create-type-check-function.js";

const isSimpleTypeAnnotation = createTypeCheckFunction([
  "TSThisType",
  // literals
  "NullLiteralTypeAnnotation",
  "BooleanLiteralTypeAnnotation",
  "StringLiteralTypeAnnotation",
  "BigIntLiteralTypeAnnotation",
  "NumberLiteralTypeAnnotation",
  "TSLiteralType",
  "TSTemplateLiteralType",
]);

export { isSimpleTypeAnnotation };
