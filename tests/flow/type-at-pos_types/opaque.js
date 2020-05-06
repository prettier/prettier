// @flow

export opaque type Foo = number;
declare var foo: Foo;

declare opaque type Bar: number;
declare var bar: Bar;

declare opaque type Baz;
declare var baz: Baz;

opaque type Bak<A> = number | A;
declare var bak: Bak<string>;

declare opaque type Bam<A>
declare var bam: Bam<string>;

import type { Opaque, PolyTransparent, PolyOpaque } from './opaque-lib';
declare var opaque: Opaque;
declare var polyTransparent: PolyTransparent<string>;
declare var polyOpaque: PolyOpaque<string>;

import { fOpaque } from './opaque-lib';
const o = fOpaque();
