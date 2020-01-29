// @flow

const React = require('react');

declare var x1: { f: number } | any;
declare var x2: any | { f: number };
declare var x3: any | { f: number } | { node: React.Node };
declare var x4: { f: number } | any | { node: React.Node };
declare var x5: { f: number } | { node: React.Node } | any;

module.exports = [
  () => x1,
  () => x2,
  () => x3,
  () => x4,
  () => x5,
];
