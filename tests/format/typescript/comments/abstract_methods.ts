abstract class AbstractFoo {
  abstract method1(/* comment */ arg: string);
  abstract method2(
    /* comment */
    arg: string
  );
  abstract method3(
    // comment
    arg: string
  );
}

// #18478
abstract class AbstractBar {
  abstract method4(
    param1: number,
    // trailing line comment
  ): void;
  abstract method5(
    param1: number,
    /* trailing block comment */
  ): void;
  abstract method6(
    ...rest: number[]
    // trailing after rest
  ): void;
  abstract method7(
    { a }: { a: number },
    // trailing after object pattern
  ): void;
}
