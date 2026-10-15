class A {
  constructor(
    private a = (
      // c
      1
    ),
  ) {}
}

class B {
  constructor(
    public readonly value = (
      // note
      2
    ),
  ) {}
}

class C {
  constructor(
    private callback = (value = (
      // Keep this with the nested default, not the parameter property.
      3
    )) => value,
  ) {}
}
