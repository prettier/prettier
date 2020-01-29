// @flow

import * as React from 'react';

class MyComponent extends React.Component<{foo: number}> {
  static defaultProps = {foo: 42};
  render() {
    return this.props.foo;
  }
}

type ReactA = React.ElementProps<typeof MyComponent>;
//   ^
type ReactAP<X> = React.ElementProps<X>;
//   ^

// The following tests caching of EvalT result. If re-evaluated the $NonMaybeType
// under the second EvalT would appear as empty
declare var a: { m<T>(x: $NonMaybeType<T>): T };
declare var b: { x: typeof a; y: typeof a; }
//          ^
