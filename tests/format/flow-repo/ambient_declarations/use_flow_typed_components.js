// @flow
// Test using components from flow-typed

import { Button, Icon } from 'component-library';

const button = <Button label="Click" />;
const icon = <Icon name="star" />;

// Error
const badButton = <Button label={42} />; // Error: number is not compatible with string
