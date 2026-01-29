// @flow
// Test using ambient components from namespace
import * as React from 'react';

import { ComponentNamespace } from './component_namespace.js';

// These should work
const card = <ComponentNamespace.Card title="Hello" content="World" />;

const modal = <ComponentNamespace.Modal isOpen={true} onClose={() => {}} />;

// Type errors
const badCard = <ComponentNamespace.Card title={123} content="World" />; // Error: number is not compatible with string

const badModal = <ComponentNamespace.Modal isOpen="true" onClose={() => {}} />; // Error: string is not compatible with boolean
