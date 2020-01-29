//@flow

type X = {[string]: null | void | X};
type Y = {...X};

// Trigger optimization for X
const x: X = {a: null, b: {c: null}};
// Trigger optimization for Y
const y: Y = {a: null, b: {c: null}};

function test(x: X): void {}
declare var a: Y;
test(a);
