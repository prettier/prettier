// @flow

import type {Info, NoBar, $DeepReadOnly } from './test.js';

export type UnionElementOne = Info<{
    foo: $DeepReadOnly<{ foo: boolean}>,
    bar: NoBar,
    baz: $DeepReadOnly<{

    }>,
  }>;
