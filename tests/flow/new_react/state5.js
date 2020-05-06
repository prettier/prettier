var React = require('react');

class C extends React.Component<{}> {
  foo(): number {
    return this.state.x; // error: need to declare type of state
  }
}
