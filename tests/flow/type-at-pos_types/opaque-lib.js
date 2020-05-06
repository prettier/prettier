// @flow

declare opaque type Poly$Opaque<A>;

export type PolyTransparent<A> = Poly$Opaque<A>;
export opaque type Opaque = number;
export opaque type PolyOpaque<A> = Poly$Opaque<A>;

declare export function fOpaque(): Opaque;
