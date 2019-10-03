const bar = 'bar';

class X {
  // https://github.com/prettier/prettier/issues/6569
  [bar]?;
  private foo? = undefined;
  "a-prop"?: boolean;
}