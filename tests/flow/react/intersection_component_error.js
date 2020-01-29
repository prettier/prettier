/**
 * @format
 * @flow
 */

import * as React from 'react';

declare var MyComponent: React.ComponentType<{foo: number}> & {
  someStatic: boolean,
};

<MyComponent />;
