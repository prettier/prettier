// @flow
// Test that component with body in regular .js file still works
import * as React from 'react';

component RegularComponent(props: { name: string }) {
  return <div>{props.name}</div>;
}

export { RegularComponent };
