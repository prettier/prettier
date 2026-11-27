x = (c ? a : b)<T>;
x =  c ? a : b <T>;

x = (y++)<T>;
// x =  y++ <T>;

x = (++y)<T>;
// x =  ++y <T>;

x = (a + b)<T>;
x =  a + b <T>;

x = (a ?? b)<T>;
x =  a ?? b <T>;

x = (a in b)<T>;
x =  a in b <T>;

x = (a ** b)<T>;
x =  a ** b <T>;

x = (!a)<T>;
x =  !a <T>;

x = (typeof a)<T>;
x =  typeof a <T>;

x = (a as B)<T>;
x =  a as B <T>;

x = (a satisfies B)<T>;
x =  a satisfies B <T>;

x = (<B>a)<T>;
x =  <B>a <T>;

x = (a<U>)<T>;
// x =  a<U> <T>;

x = (a.b)<T>;
x =  a.b <T>;

x = (a())<T>;
x =  a() <T>;
