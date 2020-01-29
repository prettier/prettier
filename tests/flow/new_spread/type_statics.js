class A {static p: number}

type O1 = {...Class<A>};
declare var o1: O1;
(o1: {p?:number}); // ok
