// @flow

import * as b from './b';

declare var TypeAssertIs: $Facebookism$TypeAssertIs;
TypeAssertIs<(x: number) => string>(8);
