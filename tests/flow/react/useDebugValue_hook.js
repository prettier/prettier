// @flow

import React from 'react';

const undefinedValue = React.useDebugValue(123);

(undefinedValue: typeof undefined); // Ok
(undefinedValue: string); // Error: undefined is incompatible with string
