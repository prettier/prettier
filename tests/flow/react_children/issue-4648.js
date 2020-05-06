// @flow

import React from 'react';
import type {ChildrenArray, Element} from 'react';

class Child extends React.Component<{
  value1: string
}> {}

class Parent extends React.Component<{
  children: ChildrenArray<Element<typeof Child>>
}> {
  render() {
    React.Children.map(this.props.children, (child) => {
      console.log(child.props);
    });
    React.Children.map(this.props.children, (child: Element<typeof Child>) => {
      console.log(child.props);
    });
    return null;
  }
}
