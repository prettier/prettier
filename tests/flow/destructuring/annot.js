// @flow
var {p}: T = {p: "foo"};
p = 42; // error: number ~> string
type T = {p: string};
