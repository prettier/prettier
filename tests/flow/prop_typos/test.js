// @flow

let x = {asdf : 3};
x.asd;
x.asdfo;
x.bsdf;
x.asd = 3;

let y = {aaaa : 3, bbaa : 3};
y.aaab;
y.bbba;
y.baaa;

class A {
    foo : 3;
    func() {}
    static s1111;
}

class B extends A {
    bar : 3;
    static s2222;
}

class C extends B {
    baz : 3;
    static s3333;
}

let a = new A;
let b = new B;
let c = new C;

a.fooo;
a.barr; // should have no suggestion
a.funk();
A.s11111;
A.s22222; // should have no suggestion

b.fooo;
b.barr;
b.funk();
B.s11111;
B.s22222;

c.fooo;
c.barr;
c.bazz;
c.funk();
C.s11111;
C.s22222;
C.s33333;

