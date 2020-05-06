import type {A} from './import-type-test';
import type {invalidA} from './import-type-test';

declare var TypeAssertIs: $Facebookism$TypeAssertIs;
declare var TypeAssertThrows: $Facebookism$TypeAssertThrows;
declare var TypeAssertWraps: $Facebookism$TypeAssertWraps;

type ResultFail = {|success: false, error: string|};
type ResultSuccess<T> = {|success: true, value: T|};
type Result<T> = ResultSuccess<T> | ResultFail;

// Testing for missing type argument
TypeAssertIs(8);

// Testing for invalid type argument of function type
TypeAssertIs<(mixed => mixed)>(8);

// Testing for aliased invalid type argument
type funtype = mixed => mixed;
TypeAssertIs<funtype>(8);

// Testing for invalid type argument of any
TypeAssertIs<any>(8);

// Testing for too many type arguments
TypeAssertIs<number, boolean>(8);

// Testing valid calls to TypeAssertIs
TypeAssertIs<number | boolean>(8);
TypeAssertIs<number>(8);

// Testing for invalid bound type argument
class C<T> {
  foo() {
    TypeAssertIs<T>(9);
    TypeAssertIs<T | number>(9);
    TypeAssertIs<{A: number, B: T}>(9);
  }
}

// Testing for nested invalid types
TypeAssertThrows<Array<(mixed => mixed)>>(9);
TypeAssertThrows<{[number]: Array<{A: number, B: any}>}>(9);

// Testing that valid imported types work
TypeAssertThrows<A>(8);

// Testing invalid imported types
TypeAssertThrows<invalidA>(8);

// Testing that functions have correct return type
(TypeAssertIs<number>(8) : number);
(TypeAssertIs<number>(8) : boolean);
(TypeAssertThrows<number>(8) : number);
(TypeAssertThrows<number | string>(8) : number);
(TypeAssertWraps<number>(8) : number);
(TypeAssertWraps<number>(8) : Result<number>);
