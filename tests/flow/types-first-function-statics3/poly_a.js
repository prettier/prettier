// @flow

const React = require("react");

type Props<T> = {|
  t: T,
  f: number
|};

const Component = <T>(props: Props<T>) => <div />;

const defaultProps = {
  f: 1
};

module.exports = Component;

module.exports.defaultProps = defaultProps;
