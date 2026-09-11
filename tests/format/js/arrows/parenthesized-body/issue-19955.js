_ = (a) => (a /* ! */ // K
)

var x11 = (a) => (a /* ! */ // K
)

_ = (a) => ((b) => {
  c();
} /* ! */ // K
)

var x21 = (a) => ((b) => {
  c();
} /* ! */ // K
)

var x22 = (a) => ((b) => {
  c();
} /* ! */ // K
),
  x23 = (a) => ((b) => {
  c();
} /* ! */ // K
)

function f() {
  return (a) => (a /* ! */ // K
)
}

throw (a) => (a /* ! */ // K
)

export default (a) => (a /* ! */ // K
)

// The parentheses are printed, so the comment stays inside them.
var x31 = (a) => (b ? c : d /* ! */)

var x32 = (a) => ((b, c) /* ! */)

_ = (a = c /* ! */)

var x33 = (a = c /* ! */)
