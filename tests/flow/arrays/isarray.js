// @flow
function hmm<Z>(array: Z) {
  if (Array.isArray(array)) {
    const problem: Array<Z> = array; // error
  }
}

function coerce<T, U>(t: T): U {
  function hmm<Z>(array: Z): Z  {
    if (!Array.isArray(array)) throw new Error("Unreachable.");
    const problem: Array<Z> = array; // error
    if (array.length === 0) throw new Error("Unreachable.");
    return problem[0];
  }
  const result: Array<{ value: T }> = hmm([{ value: t }]);
  if (Array.isArray(result)) throw new Error("Unreachable.");
  return ((result: empty).value: U);
}
const twelve: number = coerce("twelve");
twelve.toFixed();

function hmm(array: mixed) {
  if (Array.isArray(array)) {
    const problem: Array<mixed> = array; // error
    problem[1] = 0;
  }
}
