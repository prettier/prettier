// @flow

type ReadonlyMapped<T> = {readonly [K in keyof T]: T[K]};
type AddReadonlyMapped<T> = {+readonly [K in keyof T]+?: T[K]};
type RemoveReadonlyMapped<T> = {-readonly [K in keyof T]-?: T[K]};
type Remapped<T> = {[K in keyof T as `get${K}`]: T[K]};
type LongRemapped<T> = {-readonly [ExtremelyLongPropertyName in keyof T as `get${ExtremelyLongPropertyName}`]-?: T[ExtremelyLongPropertyName]};

type Commented<T> = {
  /* before readonly */ -readonly /* after readonly */ [
    K /* before in */ in /* after in */ keyof T /* before as */ as /* after as */ `get${K}` /* after remapping */
  ] /* before optional */ -? /* before colon */ : /* after colon */ T[K]
};

type LineCommentBeforeOptional<T> = {
  [K in keyof T] // before optional
  -?: T[K]
};
type LineCommentBeforeColon<T> = {
  [K in keyof T] // before colon
  : T[K]
};
type ConstructorValue<T> = {
  [K in keyof T]: new /* after new */ () => T[K]
};

opaque type FlowOnly = mixed;

type BlockCommented<T> = {
  - /* between sign and readonly */ readonly [K in keyof T]: T[K]
};

type LineCommented<T> = {
  - // between sign and readonly
  readonly [K in keyof T]: T[K]
};
