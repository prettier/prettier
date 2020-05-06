// @flow

import * as React from 'react';

declare opaque type T;
type Props = {t: T};
declare var props: Props;

type D<Context, Props> = $Diff<
  Props,
  {context: Context}
>;
type X<Context, Props> = {
  x: D<Context, Props>,
};
class Foo<
  Props: {},
  Context: {},
> extends React.Component<
  X<Context, Props>
> {}
//Error: cannot create Foo
<Foo x={props.t} />;

type Y<Context, Props> = {
  y: $Diff<Props, { context: Context }>;
};
class Bar<
  Props: {},
  Context: {},
> extends React.Component<
  Y<Context, Props>
> {}
//Error: cannot create Bar
<Bar y={props.t} />;
