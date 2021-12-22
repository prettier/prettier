const x: Obj['bar'] = 1;

type A = (T & S)['bar'];
type B = (T | S)['bar'];
type C = (?T)['bar'];
type D = (typeof x)['bar'];
type E = (string => void)['bar'];
