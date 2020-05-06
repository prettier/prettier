// @flow

class A {
  f = 1;
  m(x) {
    return this.f + 1;
  }
}

(new A).m("");
