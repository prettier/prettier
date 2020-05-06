// @noflow

type A = {kind: 'a', e: Type};
type B = {kind: 'b', k: Type, v: Type};
type C = {kind: 'c'};
type Type = A | B | C;

type TypeCases<R> = {|
    a: (A) => R,
    b: (B) => R,
    c: (C) => R
|};

function matcher<R>(cases: TypeCases<R>): (Type) => R {
    return (type) => cases[type.kind](type);
}

const f: Type => Array<string> = matcher({
    a: (a: A) => [...f(a.e)],
    b: (b: B) => [...f(b.k), ...f(b.v)],
    c: () =>  ['']
});
