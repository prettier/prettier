/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 */

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import TestUtils from 'react-dom/test-utils';

class MyTestingComponent extends React.Component<{}> {
  render() {
    return <button className="my-button" />;
  }
}

const tree = TestUtils.renderIntoDocument(<MyTestingComponent />);
TestUtils.mockComponent(MyTestingComponent);
TestUtils.mockComponent(MyTestingComponent, 'span');
(TestUtils.isElement(<MyTestingComponent />): boolean);
(TestUtils.isElementOfType(
  <MyTestingComponent />,
  MyTestingComponent,
): boolean);
(TestUtils.findRenderedDOMComponentWithClass(tree, 'my-button'): ?Element);
(TestUtils.isDOMComponent(MyTestingComponent): boolean);
(TestUtils.isCompositeComponent(tree): boolean);
(TestUtils.isCompositeComponentWithType(tree, MyTestingComponent): boolean);
(TestUtils.findAllInRenderedTree(
  tree,
  child => child.tagName === 'BUTTON',
): Array<React.Component<any, any>>);
(TestUtils.scryRenderedDOMComponentsWithClass(
  tree,
  'my-button',
): Array<Element>);

const buttonEl = TestUtils.findRenderedDOMComponentWithClass(tree, 'my-button');
if (buttonEl != null) {
  TestUtils.Simulate.click(buttonEl);
}

(TestUtils.scryRenderedDOMComponentsWithTag(tree, 'button'): Array<Element>);
(TestUtils.findRenderedDOMComponentWithTag(tree, 'button'): ?Element);
(TestUtils.scryRenderedComponentsWithType(tree, MyTestingComponent): Array<
  React.Component<any, any>,
>);
(TestUtils.findRenderedComponentWithType(
  tree,
  MyTestingComponent,
): ?React.Component<any, any>);
TestUtils.act(() => {
  Math.random();
});
TestUtils.act(() => ({count: 123})); // error
async function runTest() {
  await TestUtils.act(async () => {
    // .. some test code
    await Promise.resolve();
  });
  /* // wishlist -
  act(async () => {
    // some test code
  }); // ideally this should error
  await act(() => {
    // ...
  }); // ideally this should error
  */
}
