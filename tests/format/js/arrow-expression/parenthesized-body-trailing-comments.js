a1 = (a) => (a /* ! */ // K
)

var a2 = (a) => (a /* ! */ // K
)

a3 = (a) => ((b) => {
  c();
} /* ! */ // K
)

var a4 = (a) => ((b) => {
  c();
} /* ! */ // K
)

a5 = (a) => (a /* ! */
)

var a6 = (a) => (a /* ! */
)

a7 = (a) => (a // K
)

var a8 = (a) => (a // K
)

function a9() {
  return (a) => (a /* ! */
)
}

var a10 = (a) => (a /* ! */
), a11 = 1

// The parentheses survive, so a block comment stays inside them.
a12 = (a) => (b = c /* ! */
)

a13 = (a) => (b, c /* ! */
)

// A line comment is printed at the end of the line, past the parentheses.
a14 = (a) => (b = c // K
)

a15 = (a) => ({ a: 1 } /* ! */
)

// A JSX element and a conditional keep their parentheses, so a block comment
// stays inside them.
a18 = (a) => (<div /> /* ! */
)

a19 = (a) => (b ? c : d /* ! */ // K
)

// Not at the tail of a statement, so the comment stays on the body.
a16((a) => (a /* ! */
))

a17 = { k: (a) => (a /* ! */
) }
