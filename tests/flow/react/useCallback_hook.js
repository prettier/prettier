// @flow

import React from 'react';

{
  React.useCallback(); // Error: function requires another argument.
}

{
  const callback = React.useCallback(() => 123);
  const num: number = callback();
  const str: string = callback();// Error: number is incompatible with string.
}

{
  const callback = React.useCallback((num: number, str: string) => {
    (num: number);
    (str: string);
  });
  callback(123, 'abc'); // Ok
  callback(true); // Error: function requires another argument.
  callback('123', 'abc'); // Error: string is incompatible with number.
}
