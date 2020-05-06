// @flow

const React = require("react");
const Foo = React.createClass({
  propTypes: {
    foo: React.PropTypes.string,
    bar: React.PropTypes.string.isRequired
  },
  getInitialState() {
    return { baz: 0 };
  },
  getDefaultProps() {
    return {
      foo: "foo"
    };
  }
});

const NoState = React.createClass({
  propTypes: {
    foo: React.PropTypes.string,
    bar: React.PropTypes.string.isRequired
  },
  getDefaultProps() {
    return {
      foo: "foo"
    };
  }
});

const NoDefaultProps = React.createClass({
  propTypes: {
    foo: React.PropTypes.string,
    bar: React.PropTypes.string.isRequired
  },
});
