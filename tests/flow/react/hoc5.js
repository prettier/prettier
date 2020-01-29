/**
 * @format
 * @flow
 */

import * as React from 'react';

function hoc<Props, Component: React.ComponentType<Props>>(
  WrappedComponent: Component,
): React.ComponentType<React.ElementConfig<Component>> {
  return (props: Props) => <WrappedComponent {...props} />;
}

class MyComponent1 extends React.Component<{foo: string, bar: number}> {
  static defaultProps = {foo: 'qux'};
  render() {
    return null;
  }
}

function MyComponent2(props: {foo: string, bar: number}) {
  return null;
}
MyComponent2.defaultProps = {foo: 'qux'};

<MyComponent1 />; // Error
<MyComponent1 bar={42} />; // OK
<MyComponent1 bar="nope" />; // Error
<MyComponent1 bar={42} foo="zub" />; // OK
<MyComponent1 bar={42} foo={100} />; // Error
<MyComponent1 bar={42} foo={undefined} />; // OK

<MyComponent2 />; // Error
<MyComponent2 bar={42} />; // OK
<MyComponent2 bar="nope" />; // Error
<MyComponent2 bar={42} foo="zub" />; // OK
<MyComponent2 bar={42} foo={100} />; // Error
<MyComponent2 bar={42} foo={undefined} />; // OK

const MyEnhancedComponent1 = hoc(MyComponent1);
const MyEnhancedComponent2 = hoc(MyComponent2);

<MyEnhancedComponent1 />; // Error
<MyEnhancedComponent1 bar={42} />; // OK
<MyEnhancedComponent1 bar="nope" />; // Error
<MyEnhancedComponent1 bar={42} foo="zub" />; // OK
<MyEnhancedComponent1 bar={42} foo={100} />; // Error
<MyEnhancedComponent1 bar={42} foo={undefined} />; // OK

<MyEnhancedComponent2 />; // Error
<MyEnhancedComponent2 bar={42} />; // OK
<MyEnhancedComponent2 bar="nope" />; // Error
<MyEnhancedComponent2 bar={42} foo="zub" />; // OK
<MyEnhancedComponent2 bar={42} foo={100} />; // Error
<MyEnhancedComponent2 bar={42} foo={undefined} />; // OK
