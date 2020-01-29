// @flow

const obj = { f: {} };

obj.f = { x: 1 };
obj.f = { x: "a" };

module.exports = obj;
