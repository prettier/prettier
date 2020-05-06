// @flow

import * as React from 'react';
import Good from './Good';

<Good foo={1} buz={2} qux={3} />; // OK
<Good foo={1} buz={2} />; // Error: Missing qux
<Good foo={1} qux={3} />; // Error: Missing buz
<Good buz={2} qux={3} />; // Error: Missing foo
<Good foo={1} buz="nope" qux={3} />; // Error: Cannot multiply string
<Good foo={1} buz={2} qux="nope" />; // Error: string ~> number
