x2 = (a) => (a /* ! */ // K
)

var x2 = (a) => (a /* ! */ // K
)

var x2 = (a) => ((b) => {
  c();
} /* ! */ // K
)

var x2 = (a) => ((b) => {
  c();
} /* ! */ // K
),
  x3 = (a) => ((b) => {
  c();
} /* ! */ // K
)

function f() {
  return (a) => (a /* ! */ // K
)
}

throw (a) => (a /* ! */ // K
)

var x2 = (a) => (b ? c : d /* ! */)

var x2 = (a) => ((b, c) /* ! */)

export default (a) => (a /* ! */ // K
)
