// @flow

declare var x: string;

class A {
  get x(): string {
    return x;
  }
  set x(value: ?string) {
    x = value || "default";
  }
}
