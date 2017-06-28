/* @flow */
import React from 'react';
import type {Node} from 'react';

type Props = {name: string};

class Hello extends React.Component<{}, Props, void>{
  props: Props;
  static defaultProps: {};

  render(): Node {
    return <div>{this.props.name}</div>;
  }
}

module.exports = Hello;
