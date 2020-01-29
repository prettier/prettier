//@flow

const React = require('react');

class Component extends React.Component<{}> {}

(Component: React$AbstractComponent<any, any>);
(Component: React$AbstractComponent<{}, any>);
(Component: React$AbstractComponent<{+foo: number}, any>); // Extra props is ok

class ComponentNarrower extends React.Component<{foo: number, bar: number}> {
  static defaultProps: { foo: number } = {foo: 3};
}

(ComponentNarrower: React$AbstractComponent<any, any, any>);
(ComponentNarrower: React$AbstractComponent<{+foo?: number, +bar: number}, any>);
(ComponentNarrower: React$AbstractComponent<{}, any>); // Error missing foo and bar in config
(ComponentNarrower: React$AbstractComponent<{+foo?: number}, any>); // Error missing bar in config
(ComponentNarrower: React$AbstractComponent<any, Component>); // Error instance type is wrong
(ComponentNarrower: React$AbstractComponent<any, ComponentNarrower>);

class Subclass extends Component {}

(Subclass: React$AbstractComponent<any, Component>); // Error, Instance is covariant
(Component: React$AbstractComponent<any, Subclass>); // Ok, Instance is covariant
(Subclass : React$AbstractComponent<any, Subclass>);
