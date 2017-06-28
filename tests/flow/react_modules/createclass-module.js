/* @flow */
var React = require('react');
import type {Node} from 'react';

var Hello = React.createClass({
  propTypes: {
    name: React.PropTypes.string.isRequired,
  },

  render: function(): Node {
    return <div>{this.props.name}</div>;
  }
});

module.exports = Hello;
