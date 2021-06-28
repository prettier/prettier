type A = Obj?.['foo'];
type B = Obj?.['foo']['bar'];
type C = Obj['foo']?.['bar'];
type D = (Obj?.['foo'])['bar'];
type E = (T & S)?.['bar'];
type F = (T | S)?.['bar'];
type G = (?T)?.['bar'];
type H = (typeof x)?.['bar'];
type I = (string => void)?.['bar'];
