// @flow

import React from 'react';

{
  React.useMemo(); // Error: function requires another argument.
}

{
  let numeric: number;
  numeric = React.useMemo(() => 1); // Ok
  numeric = React.useMemo(() => 1, []); // Ok
  numeric = React.useMemo(() => 1, [1, 2, 3]); // Ok
}

{
  const invalid: number = React.useMemo(() => "abc"); // Error: string is incompatible with number
}
