// @flow

import React from 'react';

class Foo extends React.Component<{bar: number}, void> {
  static defaultProps = {bar: 42};
}

<Foo bar={42}/>; // OK
<Foo bar="42"/>; // Error
<Foo bar={undefined}/>; // OK: React will replace `undefined` with the default.
