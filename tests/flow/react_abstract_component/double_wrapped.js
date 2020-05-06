//@flow
import * as React from 'react';

class MyComponent extends React.Component<{| foo: number |}> {
  render() {
    return this.props.foo;
  }
}

function wrapper<TProps: {}, TInstance>(
  base: React$AbstractComponent<TProps, TInstance>,
): React$AbstractComponent<TProps, TInstance> {
  return base;
}

function wrapper2<TProps: {}, TInstance>(
  base: React$AbstractComponent<TProps, TInstance>,
): React$AbstractComponent<TProps, TInstance> {
  return base;
}

const WrappedBoth = wrapper(wrapper2(MyComponent));
const _a = <WrappedBoth foo={42} bar={43} />; // Error, extra prop bar
const _b = <WrappedBoth />; // Error, missing prop foo
const _c = <WrappedBoth foo={42} />;
