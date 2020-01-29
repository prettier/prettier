//@flow
type A1 = {| p: number |};
type B1 = {...A1, [number]: string};
({p: 3}: B1);

type A2 = {| p: string |};
type B2 = {...A2, p?: string};
declare var x: {p?: string}
(x: B2);

type A3 = { p: number };
type B3 = {...A3, [number]: string};
({p: 3}: B3); // Ok! even though A3 is inexact.
// You can't specify an indexer inline at runtime, so this is sound!

type A4 = { p: string };
type B4 = {...A4, p?: string};
declare var x: {p?: string}
(x: B4); // Ok for the same reason as above, except for optional props

// Ensuring we still error in these cases when the RHS is a spread
// is handled by all_cases.js
