// No errors are expected in this file.

type GenericFnType<TArgs, TReturn> = (...TArgs) => TReturn;
type T = GenericFnType<Iterable<string>, boolean>;
var t: T = function(x: string, y: string): boolean {return false;}
type U = (number, ...Iterable<string>) => boolean;
var u: U = function(x: number, y: string): boolean {return false;}
type GenericFnType2<TArgs, TReturn> = (number, ...TArgs) => TReturn;
type V = (number, ...Iterable<string>) => boolean;
var v: V = function(x: number, y: string): boolean {return false;}
