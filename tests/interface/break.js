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
> {
  m() {};
};
