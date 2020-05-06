// @flow strict

import * as c from './c';

declare var TypeAssertIs: $Facebookism$TypeAssertIs;
TypeAssertIs<(x: number) => string>(8);
