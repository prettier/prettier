// @flow

const React = require('react');

const any: any = null;

class Foo extends React.Component<{a: number, b: number, c: number}> {}

<Foo {...(any: Object)} />;
