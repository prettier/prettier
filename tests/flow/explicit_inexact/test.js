//@flow
type T = {...};
type U = {foo: number, ...};

declare var x: U;
(x: T); // Ok, by width subtyping

(x: {||}); // Error, inexact vs. exact
