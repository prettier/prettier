//@flow

// Note, no lint error because {foo: number} is now exact!
const x: {foo: number} = {foo: 3, bar: 3}; // Error, {foo: number} is exact so can't include bar

function test(x: {foo: number}) {}

const inexact: {foo: number, ...} = {foo: 3, bar: 3};
test(inexact); // Error inexact ~> exact

const exact: {foo: number} = {foo: 3};

const alsoExact: {| foo: number |} = exact;

const inexact2: {foo: number, ...} = alsoExact;
