// @flow

class C {
  override(): number | string { return 0; }
}

class D extends C {
  foo() { return this.override() }
  override(): string { return ""; }
  bar() { this.
