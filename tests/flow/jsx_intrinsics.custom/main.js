// @flow

var React = require('react');

<div id="asdf" />;
<div id={42} />; // Error: (`id` prop) number ~> string

(<div id="foo" />.props.id: string);
(<div id="foo" />.props.id: number); // Error: (`id` prop) number ~> string
