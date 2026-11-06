function foo<T>(bar  /*: T[] */, baz  /*: T */) /*: S */ {}

function generic
/* comment */
<T>(value: T): T { return value; }

const expression = function named // comment
<T>(value: T): T { return value; };
