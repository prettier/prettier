/**
 * @flow
 */

const React = require('React');

type Props = {
  elements: Array<React.Element<any>>,
};

type State = {
};

class Foo extends React.Component<Props, State> {
  bar() {
    const x = this.props.elements;
    let sliceFrom = x;
    while (sliceFrom.length < 0) {
      sliceFrom = sliceFrom.concat(sliceFrom);
    }
  }
}
