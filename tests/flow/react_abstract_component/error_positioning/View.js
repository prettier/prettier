//@flow
const React = require('react');

type ViewNativeComponentType = Class<React.Component<{||}>>;

declare var View: ViewNativeComponentType;

module.exports = View;
