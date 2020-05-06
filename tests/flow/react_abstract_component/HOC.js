//@flow

import * as React from 'react';

class Component extends React.Component<{|foo: number, bar: number|}> {
  static defaultProps: {| foo: number |} = {foo: 3};
}

function TrivialHOC<Props, Instance>(
  x: React.AbstractComponent<Props, Instance>,
): React.AbstractComponent<Props, Instance> {
  return x;
}

const TrivialWrap = TrivialHOC(Component);
(TrivialWrap: React.AbstractComponent<{|foo?: number, bar: number|}, Component>);

function WrapInDivWithExtraProp<Props, Instance>(
  x: React.AbstractComponent<Props, Instance>,
): React.AbstractComponent<{| ...Props, baz: number |}, void> {
  const C = (props: {|...Props, baz: number|}) =>
    <div>
      {props.baz}
      <x {...props} />
    </div>;
  C.defaultProps = {...x.defaultProps};
  return C;
}

const WrappedInDivWithExtraProp = WrapInDivWithExtraProp(Component); // Note, we lose instance type here
(WrappedInDivWithExtraProp: React.AbstractComponent<{| foo?: number, bar: number, baz: number |}, void>);

function AddPropWithDefault<Props, Instance>(
  x: React.AbstractComponent<Props, Instance>
): React.AbstractComponent<{| ...Props, baz?:number |}, void> {
  const C = (props: {| ...Props, baz: number |}) =>
    <div>
      {props.baz}
      <x {...props} />
    </div>;
  C.defaultProps = {...x.defaultProps, baz: 3};
  return C;
}

const WrappedAddPropWithDefault = AddPropWithDefault(Component);
(WrappedAddPropWithDefault: React.AbstractComponent<
  {| foo?: number, bar: number, baz?: number |},
  void,
 >);
