// @flow

const React = require("react");

type Props = {|
  f: number
|};

const Component = (props: Props) => <div />;

const defaultProps = {
  f: 1
};

module.exports = Component;

module.exports.defaultProps = defaultProps;
