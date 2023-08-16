import createTypeCheckFunction from "./create-type-check-function.js";

const isFlowKeywordType = createTypeCheckFunction([
  "AnyTypeAnnotation",
  "ThisTypeAnnotation",
  "NumberTypeAnnotation",
  "VoidTypeAnnotation",
  "BooleanTypeAnnotation",
  "BigIntTypeAnnotation",
  "SymbolTypeAnnotation",
  "StringTypeAnnotation",
  "NeverTypeAnnotation",
  "UndefinedTypeAnnotation",
  "UnknownTypeAnnotation",
  // FLow only
  "EmptyTypeAnnotation",
  "MixedTypeAnnotation",
]);

export default isFlowKeywordType;
