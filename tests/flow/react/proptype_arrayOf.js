/* @flow */

var React = require('react');
var Example = React.createClass({
  propTypes: {
    arr: React.PropTypes.arrayOf(React.PropTypes.number).isRequired
  },
});

var ok_empty = <Example arr={[]} />
var ok_numbers = <Example arr={[1, 2]} />

var fail_not_array = <Example arr={2} />
var fail_mistyped_elems = <Example arr={[1, "foo"]} />
