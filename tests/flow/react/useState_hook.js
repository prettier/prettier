// @flow

import React from 'react';

React.useState(); // Error: function requires another argument.

const [count, setCount] = React.useState<number>(1);

(count: number); // Ok
(count: string); // Error: number is incompatible with string

setCount(2); // Okay
setCount(true); // Error: boolean is incompatible with number
