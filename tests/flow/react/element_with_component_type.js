// @flow

const React = require('react');

class Foo extends React.Component<{a: number}> {}

(<Foo a={42}/>: React.Element<React.ComponentType<{a: number}>>); // OK
(<Foo a={42}/>: React.Element<React.ComponentType<{b: number}>>); // Error
