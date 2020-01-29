// @flow

import React from 'react';
import type {Node} from 'react';

class MyComponent extends React.Component<{children: Node}, void> {
  render(): Node {
    // OK: Can pass a node down like so.
    return <MyComponent>{this.props.children}</MyComponent>;
  }
}

class MyComponentOptional extends React.Component<{children?: Node}, void> {}

<MyComponent />; // Error: `children` is required.
<MyComponent></MyComponent>; // Error: `children` is required.
<MyComponent> </MyComponent>; // OK: `children` may be a string.
<MyComponent>{}</MyComponent>; // Error: `children` is required.
<MyComponentOptional />; // OK: `children` is optional.
<MyComponentOptional></MyComponentOptional>; // OK: `children` is optional.
<MyComponentOptional> </MyComponentOptional>; // OK: `children` may be a string.
<MyComponentOptional>{}</MyComponentOptional>; // OK: `children` is optional.

// OK: The `ReactNode` allows any children.
<MyComponent>
  {}
  {undefined}
  {null}
  {true}
  {false}
  {0}
  {42}
  {'hello world'}
  foobar
  <buz />
  {[undefined, null, true, false, 0, 42, 'hello world', 'foobar', <buz />]}
</MyComponent>;

// Error: Arbitrary objects are not allowed as children with `ReactNode`.
<MyComponent>
  {{a: 1, b: 2, c: 3}}
</MyComponent>;
