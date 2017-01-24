/* @flow */

var React = require('react');
var Example = React.createClass({
  propTypes: {
    obj: React.PropTypes.objectOf(React.PropTypes.number).isRequired
  },
});

var ok_empty = <Example obj={{}} />
var ok_numbers = <Example obj={{foo: 1, bar: 2}} />

var fail_not_object = <Example obj={2} />
var fail_mistyped_props = <Example obj={{foo: "foo"}} />
