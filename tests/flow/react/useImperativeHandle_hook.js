// @flow

import React from 'react';

{
  React.useImperativeHandle(); // Error: function requires another argument.
}

type Interface = {|
  focus: () => void
|};

{
  const api: Interface = {
    focus: () => {}
  };

  const ref: {current: null | Interface } = React.createRef();
  React.useImperativeHandle(ref, () => api); // Ok

  const refSetter = (instance: null | Interface) => {};
  React.useImperativeHandle(refSetter, () => api); // Ok
}

{
  const api: Interface = {
    focus: () => {}
  };

  const ref: {current: null | Interface } = React.createRef();
  React.useImperativeHandle(ref, () => ({})); // Error: inexact object literal is incompatible with exact Interface

  const refSetter = (instance: null | Interface) => {};
  React.useImperativeHandle(refSetter, () => ({})); // Error: inexact object literal is incompatible with exact Interface
}
