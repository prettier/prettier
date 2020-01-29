// @flow

import type {SuperType} from './super';
export opaque type Counter: number = number;
export opaque type OtherCounter: number = number;
export opaque type SuperOpaque: SuperType = SuperType;
export opaque type SuperOpaqueBad: SuperType = Counter; // Error: number ~> SuperType

class Foo {}
class Bar extends Foo {}
export opaque type ClassGood: Foo = Bar;
export opaque type ClassBad: Bar = Foo; // Error: Foo ~> Bar

export class PolyFoo<T> {}
export class PolyBar<T> extends PolyFoo<T> {}
export opaque type PolyGood<T>: PolyFoo<T> = PolyBar<T>;
export opaque type PolyBad<T>: PolyBar<T> = PolyFoo<T>; // Error: PolyFoo ~> PolyBar

class PolyBar2<T> extends PolyFoo {}
export opaque type PolyBad2<T>: PolyFoo<T> = PolyBar2<T>; // Error: Incompatible instantiation
export opaque type PolyBad3<T>: PolyBar2<T> = PolyFoo<T>; // Error: PolyFoo ~> PolyBar2

class Contra<-T> {}
class EContra<-T> extends Contra<T> {}

export opaque type OContra: Contra<number> = EContra<number | string>;
export opaque type BadContra: Contra<number | string> = EContra<string>; // Error: string ~> number

export opaque type ID: string = string;
