// @flow

import React from 'react';

React.useTransition(); // Ok

React.useTransition({}); // Error: property `timeoutMs` is missing in object literal but exists in `SuspenseConfig`

React.useTransition({foo: 1}); // Error: property `foo` is missing in `SuspenseConfig`

const [startTransition, isPending] = React.useTransition({timeoutMs: 1000}); // Ok
(isPending: boolean); // Ok

startTransition(() => {}); // Ok
startTransition(true); // error
