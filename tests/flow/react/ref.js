// @flow

import React from 'react';

class Foo extends React.Component<{}, void> {}
class Bar extends React.Component<{}, void> {}

<Foo />; // OK
<Foo ref="foo" />; // OK
<Foo ref={null} />; // OK
<Foo ref={undefined} />; // OK
<Foo ref={(foo: number) => {}} />; // Error: `Foo` is not a `number`.
<Foo ref={foo => (foo: Foo)} />; // Error: `Foo` may be null.
<Foo ref={foo => (foo: Foo | null)} />; // OK
<Foo ref={foo => (foo: Bar | null)} />; // Error: `Foo` is not `Bar`.

class FooExact extends React.Component<{||}, void> {}

<FooExact />; // OK
<FooExact ref="foo" />; // OK
<FooExact ref={null} />; // OK
<FooExact ref={undefined} />; // OK
<FooExact ref={(foo: number) => {}} />; // Error: `FooExact` is not a `number`.
<FooExact ref={foo => (foo: FooExact)} />; // Error: `FooExact` may be null.
<FooExact ref={foo => (foo: FooExact | null)} />; // OK
<FooExact ref={foo => (foo: Bar | null)} />; // Error: `FooExact` is not `Bar`.

class NumRefs extends React.Component<{}> {
  getChild(i: number) {
    return this.refs[i];
  }
  render() {
    var children = [];
    for (var i = 0; i < 10; i++) {
      children.push(<div ref={i} />);
    }
    return children;
  }
}
