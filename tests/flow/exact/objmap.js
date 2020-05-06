// @flow

type ExactThing = {| a: 1 |};

type MappedThing = $ObjMap<ExactThing, (1) => 2>;

// Works as expected
const works: MappedThing = {a: 2};

// Error as expected, `a` needs to be `2`.
const doesError: MappedThing = {a: 3};

// This should error, `b` is not part of the exact object
const shouldntWork: MappedThing = {a: 2, b: 1};
