// Simple
type T<const X> = X;
function f<const T>(): void {}
<const T>(x: T) => {}
class C<const T>{}

// With variance
type T<const +X> = X;
function f<const +T>(): void {}
<const +T>(x: T) => {}
class C<const +T>{}
