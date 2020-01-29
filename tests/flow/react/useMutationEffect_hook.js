// @flow

import React from 'react';

{
  React.useMutationEffect(); // Error: function requires another argument.
}

{
  // Ok variants without cleanup functions
  React.useMutationEffect(() => {});
  React.useMutationEffect(() => {}, []);
  React.useMutationEffect(() => {}, [1, 2, 3]);

  // Ok variants with cleanup functions
  React.useMutationEffect(() => () => {});
  React.useMutationEffect(() => () => {}, []);
  React.useMutationEffect(() => () => {}, [1, 2, 3]);
}

{
  React.useMutationEffect(1); // Error: number is incompatible with function type
  React.useMutationEffect(() => {}, 1); // Error: number is incompatible with function react-only array
}
