// https://github.com/prettier/prettier/issues/15537
const AUTHORIZATION_TOKEN_VALIDITY =
  (24 * hours /* docs */) - (1 * hours /* buffer */);

const A = (1 * 2 /* c */);
const B = (1 + 2 /* c */);
const C = (1 * 2 /* a */ /* b */);
const D = (24 * hours) - (1 * hours /* buffer */);

let assigned;
assigned = (1 * 2 /* c */);

function f() {
  return (1 * 2 /* c */);
}
