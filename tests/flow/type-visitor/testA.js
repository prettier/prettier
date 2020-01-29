//@flow
type T<A,+B> = {a: A, +b: B};

function f<A,B>(a: A, b: B): T<A,B> {
  return {a, b}
}

export default f(0, 0); // should just be missing for A, not B

// Compare to `T<+A, B>`
