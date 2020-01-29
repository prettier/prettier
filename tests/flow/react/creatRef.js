// @flow

import React from 'react';

{
  class MyComponent extends React.Component<void> {}

  const ref: {current: null | React$ComponentType<MyComponent>} = React.createRef(); // Ok
}

{
  const ref: {|current: null | number|} = React.createRef(); // Ok
}
