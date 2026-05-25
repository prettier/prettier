export class Point {
/**
 * Does something.
 */
  foo() {}

    /**
     * Does something else.
     */
  bar() {}

                /**
                 * Does
                 * something
                 * much
                 * better
                 * than
                 * the
                 * rest.
                 */
  baz() {}

      /**
       * Buzz-Fizz.
       * Note: This is indented too far.
       */
      fizzBuzz() {}

      /**
       * Turns the given string into pig-latin.
       */
              pigLatinize(value: string) {
/**
 * This is a block comment inside of a method.
 */
              }

  /**
        * One
 * Two
   * Three
* Four 
   */
  mismatchedIndentation() {}

  inline /* foo*/ (/* bar */) /* baz */ {}

  noBody(/* comment */ arg);
}

// #18478
declare class DeclareCls {
  method(
    param1: number,
    // trailing line after last param
  ): void;
}

// #18478
class Overload {
  method(
    param1: number,
    // trailing line on first overload
  ): void;
  method(param1: string): void;
  method(param1: number | string): void {}
}
