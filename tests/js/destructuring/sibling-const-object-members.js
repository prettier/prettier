// these siblings should be destructured on multiple lines:
const { a: { innerMember }, b: { anotherInnerMember } } = something;

// these siblings are small enough for one line:
const { a: { innerMember2 }, littleSibling } = something;

// small enough for one line:
const {
  tinySibling1,
  tinySibling2,
  tinySibling3
} = something;

// respect blank line within destrucured const object:
const {
  tinySibling4,

  tinySibling5,
  tinySibling6
} = something;

// small enough for one line:
const { a: { innerData } = {} } = thing;

// small enough for one line:
const { firstMember = {}, secondMember = {} } = thing;

// these destructured objects should be split into multiple lines:
const { a: { innerData1, innerData2 } = {}, b: { innerData3 } = {} } = thing;

// XXX TODO [KNOWN REGRESSION] should be split into multiple lines
// due to the deep member:
const { a: { b: { deepMember } } } = abc
