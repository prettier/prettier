var React = require('react');

var C = React.createClass({
  propTypes: {
    title: React.PropTypes.string.isRequired,
  }
});
var D = React.createClass({
  propTypes: {
    name: React.PropTypes.string.isRequired,
    ...C.propTypes,
  }
});

<D />; // errors: properties `name` and `title` not found
