// @flow

import React from 'react';

function myHOC(
  Component: React$ComponentType<{foo: number, bar: number}>,
): React$ComponentType<{foo: number}> {
  return class extends React.Component<{foo: number}, {bar: number}> {
    state = {bar: 2};
    render() {
      <Component />; // Error: `foo` is required.
      <Component foo={42} />; // Error: `bar` is required.
      <Component foo={1} bar={2} />; // OK
      return <Component foo={this.props.foo} bar={this.state.bar}/>;
    }
  }
}

class Unwrapped extends React.Component<{
  foo: number,
  bar: number,
}, {
  buz: number,
}> {
  state = {buz: 3};
  render() {
    return this.props.foo + this.props.bar + this.state.buz;
  }
}

function UnwrappedFun(props: {foo: number, bar: number}) {
  return props.foo + props.bar;
}

myHOC(class Empty extends React.Component<{foo: string}, void> {}); // Error
myHOC(function Empty(props: {foo: string}) {}); // Error

const Wrapped: React$ComponentType<{foo: number}> = myHOC(Unwrapped);
const WrappedFun = myHOC(UnwrappedFun);

<Wrapped nonsense="what" />; // Error: `foo` is required.
<Wrapped foo={1} />; // OK
<WrappedFun />; // Error: `foo` is required.
<WrappedFun foo={1}/>; // OK
