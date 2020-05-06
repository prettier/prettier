// @flow

const React = require('react');

const Component = require('./a');

<Component/>;
<Component other={1}/>;

const PolyComponent = require('./poly_a');

<PolyComponent t={0}/>;
<PolyComponent t={0} other={1}/>;
