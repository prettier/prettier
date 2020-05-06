/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * Used to test type_assert for imported types.
 *
 * @flow strict
 * @format
 */

'use strict';

export type A = number;

export type invalidA = mixed => mixed;

export class testClass {}
