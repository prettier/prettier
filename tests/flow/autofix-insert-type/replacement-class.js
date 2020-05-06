// @flow

class A { // end of line comment
                                f = 1;
  m(x) { return this.f + 1; }
} (new A).m(""); // weird spacing
