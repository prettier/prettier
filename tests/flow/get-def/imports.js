// @flow

import thing from "./helpers/exports_default.js";
thing;

import {foo, bar as baz, letBinding, varBinding, fun, Cls} from "./helpers/exports_named.js";
foo;
baz;

import * as things from "./helpers/exports_named.js";
things;

// $FlowFixMe
import type {DoesNotExist} from "./doesNotExist";
const x: DoesNotExist<number> = "foo";
x.foo();

type Foo = any;
// $FlowFixMe
const y: Foo<number> = "foo";
// $FlowFixMe
y.foo();
