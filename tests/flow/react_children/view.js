// @flow

import React from 'react';

type ReactNodeWithoutString =
  | void
  | null
  | boolean
  | React$Element<any>
  | Array<ReactNodeWithoutString>; // NOTE: This is intentionally `Array<T>` and
                                   // not `Iterable<T>` because `strings` are
                                   // `Iterable<string>` which is then
                                   // `Iterable<Iterable<string>>` recursively
                                   // making strings valid children when we use
                                   // `Iterable<T>`.

class View extends React.Component<{children: ReactNodeWithoutString}, void> {}

// OK: Allows any non-string children.
<View>
  {}
  {undefined}
  {null}
  {true}
  {false}
  <buz />
  {[undefined, null, true, false, <buz />]}
</View>;

// Error: Arbitrary objects are not allowed as children.
<View>
  {{a: 1, b: 2, c: 3}}
</View>;

<View>Hello, world!</View>; // Error: Strings are not allowed as children.
<View>{'Hello, world!'}</View>; // Error: Strings are not allowed as children.
<View>{42}</View>; // Error: Numbers are not allowed as children.
<View>{1}{2}{3}</View>; // Error: Numbers are not allowed as children.
<View>{['a', 'b', 'c']}</View>; // Error: Strings are not allowed deeply.
<View>{[1, 2, 3]}</View>; // Error: Numbers are not allowed deeply.
