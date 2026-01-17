import { generateReferenceSharedVisitorKeys } from "../utilities/visitor-keys.js";

const visitorKeys = generateReferenceSharedVisitorKeys({
  JsonRoot: ["node"],
  ArrayExpression: ["elements"],
  ObjectExpression: ["properties"],
  ObjectProperty: ["key", "value"],
  UnaryExpression: ["argument"],
  NullLiteral: [],
  BooleanLiteral: [],
  StringLiteral: [],
  NumericLiteral: [],
  Identifier: [],
  TemplateLiteral: ["quasis"],
  TemplateElement: [],
});

export default visitorKeys;
