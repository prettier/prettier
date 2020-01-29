class A {}
class B {}
class C {}
class D {}

declare var one : $Diff<{a: A} | {b: B}, {b: B}>;
(one : {}); //error

declare var two : $Diff<{a: A, b : B} | {b: B}, {b: B}>;
(two :  {a : A} | {});
(two :  {});
(two :  {a : A}); // error
(two :  {a : A, b : B} | {});

declare var three : {a : A, b : B} | {};
(three : typeof two); // TODO: should be an error

declare var four : $Diff<{a: A, b: B, c: C}, {a: A} | {b: B}>;
(four : {a: A, c: C} | {b: B, c: C});
(four : {a : A, c : C}); //error
(four : {a : A, b : C, c : C}); //error
(four : {c : C});

declare var five : $Diff<{a: A, c : C} | {b: B, c : C}, {a : A} | {b: B}>;
(five : {c : C}); //error


declare var six : $Diff<{a: A, b : B, c : C} | {a : A, b: B, d : D}, {a : A} | {b: B}>;
(six : {c : C} | {d : D});
(six : {c : C, d : D}); // error
(six : {});
