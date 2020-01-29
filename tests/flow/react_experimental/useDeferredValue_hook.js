// @flow

import React from 'react';

React.useDeferredValue(true); // Ok

React.useDeferredValue(true, {}); // Error: property `timeoutMs` is missing in object literal but exists in `SuspenseConfig`

React.useDeferredValue(true, {foo: 1}); // Error: property `foo` is missing in `SuspenseConfig`

const deferredValue = React.useDeferredValue(true, {timeoutMs: 1000}); // Ok

(deferredValue: boolean); // Ok
