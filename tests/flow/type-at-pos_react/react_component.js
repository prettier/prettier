// @flow

const React = require('react');

type Props = {|
  name: string
|};

type State = {|
  enabled: boolean
|}

class Welcome extends React.Component<Props, State> {
  state = {
    enabled: false
  }
  render() {
    if (this.state.enabled) {
      return <h1>Hello, {this.props.name}</h1>;
    } else {
      return <h1>Hello</h1>;
    }

  }
}

React.default.Children;
React.default.PropTypes;
React.default.Component;

React.Fragment
declare var react_ct: React.ComponentType<number>;
