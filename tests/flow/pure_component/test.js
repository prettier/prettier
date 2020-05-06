var React = require('react');

class C extends React.PureComponent<{ x: number }> {}
(<C />); // error (`x` is a required prop)
