const { a: { innerMember }, b: { anotherInnerMember } } = something;

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
