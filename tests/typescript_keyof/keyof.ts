type A = keyof (T | U);
type B = keyof (X & Y);
type C = keyof T | U;
type D = keyof X & Y;

