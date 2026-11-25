const assertion = values
  .map((value) => ({
    value,
  }))
  .filter((value) => value) as Foo | Bar | Baz | Qux;

const satisfies = values
  .map((value) => ({
    value,
  }))
  .filter((value) => value) satisfies { value: string } | { value: number };

const plain = value as Foo | Bar | Baz | Qux;
