//@flow
const React = require('react');

declare function HOC<Config: {}, Instance>(
    x: React.AbstractComponent<Config, Instance>,
): React.AbstractComponent<Config, Instance>;

class A extends React.Component<{}> {}

module.exports = HOC(A); // Error, missing annotation only for Config
