const visitorKeys = {
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
};

export default visitorKeys;
