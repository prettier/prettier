/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * @flow
 * @format
 */
import type {Enum} from 'somewhere';

function bar(e: Enum) {
  switch (e) {
    case Enum.FOO:
      return 0;
    default:
      return null;
  }
}
