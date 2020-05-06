// @flow

import React from 'react';

{
  const {StrictMode} = React;

  <StrictMode>
    <div />
  </StrictMode>
}

{
  const {Component, StrictMode} = React;

  class ClassExample extends Component<{||}> {
    render() {
      return null;
    }
  }

  <StrictMode>
    <ClassExample />
  </StrictMode>
}

{
  const {StrictMode} = React;

  function FunctionExample() {
    return null;
  }

  <StrictMode>
    <FunctionExample />
  </StrictMode>
}
