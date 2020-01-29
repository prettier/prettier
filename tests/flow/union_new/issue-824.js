import { B, C } from "./issue-824-helper";

type K = B | C;

type I = {
  which(): number;
};

export default class A {
  static foo(p: K): bool {
    return false;
  }
  static bar(p: I & K): bool {
    /* TODO: This should be OK. In general, I&K < K for any I and K.  This used
     * to "work" but started erroring after we moved infer into merge.  A
     * simpler repro:
     *
     * declare var x: bool & (number | string);
     * (x: number | string);
     */
    return this.foo(p);
  }
}
