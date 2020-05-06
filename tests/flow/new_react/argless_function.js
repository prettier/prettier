//@flow

const React = require('react');

function Component(): React.Node { return null; }

const element = <Component />;

var x: React.ElementProps<typeof Component> = element.props;
x.foo = 3; // Error, the props type for Component is a sealed empty object.
