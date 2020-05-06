// @flow

var React = require('react');
import type {Element} from 'react';

var A = React.createClass({
  propTypes: { foo: React.PropTypes.string.isRequired }
});

var B = React.createClass({
  propTypes: { bar: React.PropTypes.string.isRequired }
});

function f(b): Element<*> {
  if (b) {
    return <A foo="hey"/>;
  } else {
    return <B bar="hey"/>;
  }
}
