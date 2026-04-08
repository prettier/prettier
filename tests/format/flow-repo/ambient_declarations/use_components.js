// @flow
// Test using ambient component declarations from .flow file
import * as React from 'react';

import { Button, Input } from './components.js';

// These should type-check correctly
const button = <Button props={{ label: "Click me" }} />;

const input = <Input value="test" onChange={(v) => console.log(v)} />;

// Type errors
const badButton = <Button props={{ label: 123 }} />; // Error: number is not compatible with string

const badInput = <Input value="test" onChange={(v: number) => console.log(v)} />; // Error: string is not compatible with number
