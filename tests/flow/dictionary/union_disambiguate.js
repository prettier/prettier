/* A function is arguably compatible with both branches of the union below, but
 * we should choose the first branch, even without annotations on the function
 * parameter and return types. */
type T<X> = (X => X) | X;
type D = { [string]: number };
(x => x: T<D>);
