// @flow

class A {
    m(this : number, a : number, b : string) {}
    n(this : number, ...c) {}
    o(this : number) {}
}
