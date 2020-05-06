// @flow

import * as React from 'react';

function create<P: Object>(
  Component: React.ComponentType<{...P, ...{}}>,
): React.ComponentType<P> {
  return Component;
}

export type Props = {
  x: {},
};

function create1<P: Object>(
  Component: React.ComponentType<P & Props>,
): React.ComponentType<P> {
  return Component;
}

class Foo extends React.Component<Props> {}

Foo = create(create1(Foo));
<Foo />;
