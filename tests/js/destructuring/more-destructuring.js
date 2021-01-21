// these siblings should be destructured on multiple lines:
const { a: { innerMember }, b: { anotherInnerMember } } = something;

// these siblings are small enough for one line:
const { a: { innerMember2 }, littleSibling } = something;

// these arguments should be destructured on multiple lines:
function f2({ first: { inner1, inner2 }, second: { inner3, inner4 } }) {}

// small enough for one line:
const reducer1 = ({ first, second : { third } }) => combine(second, third);

// these arguments should be destructured on multiple lines:
const r2 = ({ a: { data1 }, b: { data2, data3 } }) => f(data1, data2, data3);

// support destructuring with a blank line in the middle:
const reducer3 = ({
  firstMember,

  second: { data2, data3 }
}) => f(firstMember, data2, data3);

// this destructuring is small enough for one line:
const reducer4 = ({
  a,
  innerData: { b, c }
}) => f(a, b, c);

const obj2 = {
  // these arguments should be destructured on multiple lines:
  func({ a: { info1, info2 }, b: { info3, info4 } }) {}
};

class A2 {
  // these arguments should be destructured on multiple lines:
  func({ a: { info1, info2 }, b: { info3, info4 } }) {}
}

// these catch arguments should be destructured on multiple lines:
try {
  // code
} catch ({ first: { info1, info2 }, second: { info3, info4 } }) {
  // code
}

// small enough for one line:
const { a: { innerData } = {} } = thing;

// small enough for one line:
const { firstMember = {}, secondMember = {} } = thing;

// these destructured objects should be split into multiple lines:
const { a: { innerData1, innerData2 } = {}, b: { innerData3 } = {} } = thing;

// in arrow function arguments nested inside a function call,
// small enough for one line:
registerReducer(({a: { b, c } }) => combine(b, c))

// in arrow function arguments nested inside a function call,
// should be split into multiple lines:
registerReducer(({a: { b, c }, d: {e, f } }) => combine(b, c, e, f))

// XXX TODO [KNOWN REGRESSION] should be split into multiple lines
// due to the deep member:
const { a: { b: { deepMember } } } = abc
