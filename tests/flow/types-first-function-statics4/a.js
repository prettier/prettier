// @flow

function foo() {}
foo.x = 1;

const bar = () => {};
bar.x = 1;

const React = require("react");

type Props = {|
  f: number
|};

const defaultProps = {
  f: 1
};

function FooComponent(props: Props) { return <div />; }
FooComponent.defaultProps = defaultProps;

const BarComponent = (props: Props) => <div />;
BarComponent.defaultProps = defaultProps;

module.exports = { foo, bar, FooComponent, BarComponent };
