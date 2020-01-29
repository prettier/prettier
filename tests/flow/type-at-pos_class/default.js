// @flow

let y = 0;
class C { m(x = y) {} }
class D { m({x = y}) {} }
