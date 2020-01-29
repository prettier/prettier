// @flow

declare var o1: typeof o2;
const o2 = {
  x: 0,
  y: o1,
};

module.exports = o2; // recursive object type
