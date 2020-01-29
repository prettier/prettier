type A = { p: {} }
type B = { +p: () => void }
declare var a: A;
(a: B); // error HERE and preserve use ops
