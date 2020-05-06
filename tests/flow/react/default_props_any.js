// @flow

import React from 'react';

class Foo extends React.Component<{required: number}> {
  static defaultProps: Object;
}

class Bar extends React.Component<{required: number}> {
  static defaultProps: any;
}

<Foo/>;
<Bar/>;
