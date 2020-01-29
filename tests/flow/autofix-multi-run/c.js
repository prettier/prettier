// @flow

class C0 { }
class C1 { m1() { return C0; } }
class C2 { m2() { return C1; } }

module.exports = C2;
