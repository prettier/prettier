/* This test ensures that computed properties are considered before allowing
 * writes to happen on the created object.
 *
 * To construct an example with a possible race condition, we create two tvars
 * that will resolve at different times. The `K` type and the default export
 * below are imported by b.js and c.js and used in property reads and writes. */

export type K = "FOO";
module.exports = Object.freeze({FOO:"FOO"});
