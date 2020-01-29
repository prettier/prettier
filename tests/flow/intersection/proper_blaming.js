/**
 * @flow
 */

type O = {p: null} & E;
declare var o: O;

const x = o.p; // no error here
x.nope; // error here

type E = {};
