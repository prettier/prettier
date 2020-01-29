// @flow

import * as React from 'react';
import * as ReactDOM from 'react-dom';

declare class MyPortalComponent extends React.Component<{}> {}

class MyComponent extends React.Component<{}> {
  render() {
    return ReactDOM.createPortal(
      <MyPortalComponent />,
      test$getElementById('portal'),
    );
  }
}
