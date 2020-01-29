//@flow
const React = require('react');

class Component extends React.Component<{}> {}
class Subcomponent extends Component {}

function test1(x: React$AbstractComponent<{}, Component>): React$AbstractComponent<{}, Component> { // Ok, all unify
  return x;
}

function test2(x: React$AbstractComponent<{}, Component>): React$AbstractComponent<{foo: number}, Component> { // Extra props is ok
  return x;
}

function test3(x: React$AbstractComponent<{foo: number}, Component>): React$AbstractComponent<{}, Component> { // Error missing props
  return x;
}

function test4(x: React$AbstractComponent<{}, Component>): React$AbstractComponent<{}, Subcomponent> { // Error instance is covariant
  return x;
}

function test5(x: React$AbstractComponent<{}, Subcomponent>): React$AbstractComponent<{}, Component> { // Ok, instance is covariant
  return x;
}
