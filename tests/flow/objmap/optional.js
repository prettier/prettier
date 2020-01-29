// @flow

declare var o1: $ObjMap<{a: number, b?: number}, <T>(T) => Array<T>>;
declare var o2: $ObjMap<{a: number, b?: number}, <T>(T) => Array<T>>;
declare var o3: $ObjMap<{a: number, b?: number}, <T>(T) => Array<T>>;

declare var o4: $ObjMapi<{a: number, b?: number}, <T>(any, T) => Array<T>>;
declare var o5: $ObjMapi<{a: number, b?: number}, <T>(any, T) => Array<T>>;
declare var o6: $ObjMapi<{a: number, b?: number}, <T>(any, T) => Array<T>>;

(o1.a: Array<number>); // OK
(o2.b: Array<number> | void); // OK
(o3.b: Array<number | void>); // Error: void ~> array

(o4.a: Array<number>); // OK
(o5.b: Array<number> | void); // OK
(o6.b: Array<number | void>); // Error: void ~> array
