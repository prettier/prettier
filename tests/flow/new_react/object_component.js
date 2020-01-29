//@flow

const React = require('react');

// Callable objects are valid react components with a void instance type.

type ObjectComponent = {
  (props: {| foo: number, bar: number |}): React.Node,
  defaultProps: {| foo: number |},
};

declare var Component: ObjectComponent;

const _a = <Component />; // Error, missing bar
const _b = <Component bar={3} />; // Ok
const _c = <Component foo={3} bar={3} />; // Ok
const _d = <Component foo={3} bar={3} baz={3} />; // Error, baz is not in the config

const _x: React.ElementRef<ObjectComponent> = undefined; // ok
const _y: React.ElementRef<ObjectComponent> = null; // Error, ref is undefined

const _props: React.ElementProps<ObjectComponent> = {foo: 3, bar: 3};
const _badProps: React.ElementProps<ObjectComponent> = {bar: 3}; // Error missing foo
const _badProps2: React.ElementProps<ObjectComponent> = {bar: 3, foo: 3, baz: 3}; // Error extra baz

const AC: React.AbstractComponent<{| +foo?: number, +bar: number |}, void> = Component;
