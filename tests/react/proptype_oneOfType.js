/* @flow */

var React = require('react');
var Example = React.createClass({
  propTypes: {
    prop: React.PropTypes.oneOfType([
      React.PropTypes.string,
      React.PropTypes.number
    ]).isRequired
  },
  render() {
    if (typeof this.props.prop === "string") {
      return <div>{this.props.prop}</div>
    } else {
      return <div>{this.props.prop.toFixed(2)}</div>
    }
  }
});

var ok_number = <Example prop={42} />;
var ok_string = <Example prop="bar" />;

var fail_bool = <Example prop={true} />
