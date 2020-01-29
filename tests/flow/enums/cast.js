// @flow

enum B of boolean {
  A = true,
  B = false,
}

enum N of number {
  A = 1,
  B = 2,
}

enum S of string {
  A,
  B,
}

enum Y of symbol {
  A,
  B,
}

enum B2 of boolean {
  A = true,
  B = false,
}


const s: string = (S.A: string); // OK
const b: boolean = (B.A: boolean); // OK
const n: number = (N.A: number); // OK
const y: symbol = (Y.A: symbol); // OK

const X = B; // Renaming
(X.A: boolean); // OK

(S.A: ?string); // Error: if casting to representation type, must cast to exactly it

const ss: S = (S.A: S); // OK
const bb: B = (B.A: B); // OK
const nn: N = (N.A: N); // OK
const yy: Y = (Y.A: Y); // OK

(S.A: ?S); // OK
(S.A: S | B); // OK
(S.A: mixed); // OK

type T = string;
(S.A: T); // OK

(B.A: number); // Error
(S.A: boolean); // Error
(N.A: boolean); // Error
(Y.A: boolean); // Error
(X.A: string); // Error

declare var BB: typeof B | typeof B2;
const bba: B | B2 = BB.A;
(BB.A: boolean); // OK

declare var BS: typeof B | typeof S;
const bsa: B | S  = BS.A;
(BS.A: string | boolean); // Error

declare var sb: S | B;
(sb: string | boolean); // Error

declare var bs: B | B2;
(bs: boolean); // Error
