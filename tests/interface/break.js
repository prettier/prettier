export interface Environment1 extends GenericEnvironment<
  SomeType,
  AnotherType,
  YetAnotherType,
> {
  m(): void;
};
export class Environment2 extends GenericEnvironment<
  SomeType,
  AnotherType,
  YetAnotherType,
  DifferentType1,
  DifferentType2,
  DifferentType3,
  DifferentType4,
> {
  m() {};
};
