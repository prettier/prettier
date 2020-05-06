/**
 * @format
 * @flow
 */

import fn from './merged';

fn({}); // Ok
fn({foo: 42}); // Error: `foo` is not in `{||}`
