class Foo {
  // PropertyDefinition
  @decorator
  readonly /* comment */ propertyDefinition;

  // MethodDefinition
  @decorator
  private /* comment */ methodDefinition() {}

  // AccessorProperty
  @decorator
  accessor /* comment */ accessorProperty = 3;

  constructor(
    // TSParameterProperty
    @decorator
    readonly /* comment */ parameterProperty,
  ) {}
}
