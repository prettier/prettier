// @flow strict

import * as a from './a';

declare var TypeAssertIs: $Facebookism$TypeAssertIs;
TypeAssertIs<(x: number) => string>(8);
