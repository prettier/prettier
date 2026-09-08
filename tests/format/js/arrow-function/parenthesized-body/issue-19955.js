x2 = (a) => (a /* ! */
)

var x2 = (a) => (a /* ! */
)

x2 = (a) => (a /* ! */ // K
)

var x2 = (a) => (a /* ! */ // K
)

x2 = (a) => ((b) => {
  c();
} /* ! */ // K
)

var x2 = (a) => ((b) => {
  c();
} /* ! */ // K
)

const withCall = () => (f() /* ! */);
let withObject = () => ({ a: 1 } /* ! */);
withMember = (a) => (a.b /* ! */);
withChain = a = (b) => (c /* ! */);
