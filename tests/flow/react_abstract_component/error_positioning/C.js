//@flow
const React = require('react');
const View = require('./View');

type Props = {|
  component: React$ComponentType<*>,
|};

class C extends React.PureComponent<Props> {

  render(): React.Node {

    const Component = this.props.component;

    return (
      <Component {...this.props} />
    );
  }
}

module.exports = C;
