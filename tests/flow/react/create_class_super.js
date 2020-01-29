// @flow

const React = require("react");

const Base = React.createClass({
  render: () => null,
});

class Derived extends Base {
  render() { return null } // ok, Base#render is covariant
}

(<Derived />);
