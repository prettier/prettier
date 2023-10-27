// @flow

const x = y satisfies T;

// demonstrating how "satisfies" expression can be practically used as expression statement.
const _ = (type: 'foo' | 'bar') => {
switch (type) {
  case 'foo':
    return 1;
  case 'bar':
    return 2;
  default:
    // exhaustiveness check idiom
    (type) satisfies empty;
    throw new Error('unreachable');
}
}

function needParens() {
(let) satisfies mixed;
(interface) satisfies mixed;
(module) satisfies mixed;
(using) satisfies mixed;
(yield) satisfies mixed;
(await) satisfies mixed;
}

function noNeedParens() {
async satisfies mixed;
satisfies satisfies mixed;
as satisfies mixed;
opaque satisfies mixed;

abc satisfies mixed; // not a keyword
}

function satisfiesChain() {
satisfies satisfies satisfies satisfies satisfies;
(type) satisfies empty satisfies mixed;
}
