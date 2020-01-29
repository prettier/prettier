// @flow

declare var bad1: mixed;
declare var bad2: () => {};
declare var good1: number;
declare var good2: {foo: string};

// error: undefined is not compatible with string
(JSON.stringify(bad1): string);

// TODO should error, but currently does not. We allow functions to be coerced to objects
(JSON.stringify(bad2): string);

(JSON.stringify(good1): string); // ok
(JSON.stringify(good2): string); // ok
