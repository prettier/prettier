// @flow

'use strict';

type Enum1 = 'A' | 'B' | 'C';

type Enum2 = 'D' | 'E' | 'F';

type Union =
  | Enum1
  | Enum2;

class C {
  static FOO: Union = 'A';
}

declare var x: Union;

const _ = x == C.FOO;
