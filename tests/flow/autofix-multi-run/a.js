// @flow

class C0 { }
class C1 { m1() { return C0; } }
class C2 { m2() { return C1; } }
class C3 { m3() { return C2; } }
class C4 { m4() { return C3; } }

module.exports = C4;
