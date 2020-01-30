//@flow

type N = number; // untrusted
type T = $Trusted<number>; // trusted
type TE = $Trusted<empty>; // empty
type E = empty; // empty
type A = any; // any

type U1 = N | T; // untrusted
type U2 = E | T; // untrusted
type U3 = A | T; // any
type U4 = E | N; // untrusted
type U5 = A | N; // any
type U6 = TE | E; // empty
type U7 = TE | T; // trusted
type U8 = TE | A; // any
type U9 = TE | N; // untrusted

type I1 = N & T; // trusted
type I2 = E & T; // empty
type I3 = A & T; // any
type I4 = E & N; // untrusted
type I5 = A & N; // any
type I6 = TE & E; // empty
type I7 = TE & T; // empty
type I8 = TE & A; // any
type I9 = TE & N; // empty

type O1 = $Trusted<{x : N}>
type O2 = $Trusted<{x : A}>
type O3 = $Trusted<{x : T}>
type O4 = $Trusted<{x : E}>

declare var o1 : O1;
declare var o2 : O2;
declare var o3 : O3;
declare var o4 : O4;

o1.x;
o2.x;
o3.x;
o4.x;
