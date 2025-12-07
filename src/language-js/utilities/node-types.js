import createTypeCheckFunction from "./create-type-check-function.js";

export const isBinaryCastExpression = createTypeCheckFunction([
  // TS
  "TSAsExpression",
  "TSSatisfiesExpression",
  // Flow
  "AsExpression",
  "AsConstExpression",
  "SatisfiesExpression",
]);

export const isUnionType = createTypeCheckFunction([
  "TSUnionType",
  "UnionTypeAnnotation",
]);

export const isIntersectionType = createTypeCheckFunction([
  "TSIntersectionType",
  "IntersectionTypeAnnotation",
]);

export const isConditionalType = createTypeCheckFunction([
  "TSConditionalType",
  "ConditionalTypeAnnotation",
]);

export const isTypeAlias = createTypeCheckFunction([
  "TSTypeAliasDeclaration",
  "TypeAlias",
]);

export const isReturnOrThrowStatement = createTypeCheckFunction([
  "ReturnStatement",
  "ThrowStatement",
]);

export const isExportDeclaration = createTypeCheckFunction([
  "ExportDefaultDeclaration",
  "DeclareExportDeclaration",
  "ExportNamedDeclaration",
  "ExportAllDeclaration",
  "DeclareExportAllDeclaration",
]);

// These two functions exists because we used support `recordAndTuple`
// Feel free to check `node.type` instead
// https://github.com/prettier/prettier/pull/17363
export const isArrayExpression = createTypeCheckFunction(["ArrayExpression"]);
export const isObjectExpression = createTypeCheckFunction(["ObjectExpression"]);

export const isLiteral = createTypeCheckFunction([
  "Literal",
  "BooleanLiteral",
  "BigIntLiteral", // Babel, flow use `BigIntLiteral` too
  "DirectiveLiteral",
  "NullLiteral",
  "NumericLiteral",
  "RegExpLiteral",
  "StringLiteral",
]);

export const isObjectType = createTypeCheckFunction([
  "ObjectTypeAnnotation",
  "TSTypeLiteral",
  "TSMappedType",
]);

export const isFunctionOrArrowExpression = createTypeCheckFunction([
  "FunctionExpression",
  "ArrowFunctionExpression",
]);

export const isJsxElement = createTypeCheckFunction([
  "JSXElement",
  "JSXFragment",
]);

export const isBinaryish = createTypeCheckFunction([
  "BinaryExpression",
  "LogicalExpression",
  "NGPipeExpression",
]);
