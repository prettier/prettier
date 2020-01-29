// @flow

import React from 'react';

{
  React.useLayoutEffect(); // Error: function requires another argument.
}

{
  // Ok variants without cleanup functions
  React.useLayoutEffect(() => {});
  React.useLayoutEffect(() => {}, []);
  React.useLayoutEffect(() => {}, [1, 2, 3]);

  // Ok variants with cleanup functions
  React.useLayoutEffect(() => () => {});
  React.useLayoutEffect(() => () => {}, []);
  React.useLayoutEffect(() => () => {}, [1, 2, 3]);
}

{
  React.useLayoutEffect(1); // Error: number is incompatible with function type
  React.useLayoutEffect(() => {}, 1); // Error: number is incompatible with function react-only array
  React.useLayoutEffect(async () => {}) // Error: promise is incompatible with function return type
  React.useLayoutEffect(() => () => 123) // Error: cleanup function should not return a value
}
