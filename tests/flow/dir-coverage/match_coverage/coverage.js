// @flow

const a1 = 5;
const a2: any = a1 - 2;
const a3 = a2 + 1;

type E  = empty;

type U1 = any | number;
type U2 = number | any;
type U3 = empty | number;
type U4 = number | empty;
type U5 = empty | any;
type U6 = any | empty;
type U7 = number | number;

type I1 = any & number;
type I2 = number & any;
type I3 = empty & number;
type I4 = number & empty;
type I5 = empty & any;
type I6 = any & empty;
type I7 = number & number;

type R = R;

type RU1 = RU1 | any;
type RU2 = RU2 | empty;
type RU3 = any | RU3;
type RU4 = empty | RU4;
type RU5 = RU5;
type RU6 = RU6 | number;
type RU7 = number | RU7;
type RU8 = RU8 | RU8;

type RI1 = RI1 & any;
type RI2 = RI2 & empty;
type RI3 = any & RI3;
type RI4 = empty & RI4;
type RI5 = RI5 & number;
type RI6 = number & RI6;
type RI7 = RI7 & RI7;
