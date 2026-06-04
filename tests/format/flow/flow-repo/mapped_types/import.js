import type {
  MappedO,
  AddOptional,
  AllReadonly,
  ParameterizedId,
  ParameterizedPartial,
  ParameterizedReadonly,
  MappedNonHomomorphic,
  SemiHomomorphic,
} from './export';

// No modifiers concrete
{
  ({foo: 3, bar: 'str', baz: true} as MappedO); // OK

  declare const mapped: MappedO;
  mapped as {foo: number, bar?: string, readonly baz: boolean}; // OK
  mapped as {foo: empty, bar: empty, readonly baz: empty}; // ERROR
  mapped.baz = true; // ERROR
}

// Add optional concrete
{
  ({foo: undefined, bar: undefined, baz: undefined} as AddOptional); // OK
  declare const addOptional: AddOptional;
  addOptional as {foo?: number, bar?: string, readonly baz?: boolean}; // OK
  addOptional.baz = true; // ERROR
}

// Add readonly concrete
{
  ({foo: 3, bar: undefined, baz: true} as AllReadonly);
  declare const readonly: AllReadonly;
  readonly.foo = 4; // ERROR;
  readonly.bar = 'str'; // ERROR;
  readonly.baz = false; // ERROR;
}

// All of these tests are the same as above but use a parameterize type alias
type O = {foo: number, bar?: string, readonly baz: boolean};
// No modifiers parameterized
{
  ({foo: 3, bar: 'str', baz: true} as ParameterizedId<O>); // OK

  declare const mapped: ParameterizedId<O>;
  mapped as {foo: number, bar?: string, readonly baz: boolean}; // OK
  mapped as {foo: empty, bar: empty, readonly baz: empty}; // ERROR
  mapped.baz = true; // ERROR
}

// Add optional parameterized
{
  ({foo: undefined, bar: undefined, baz: undefined} as ParameterizedPartial<O>); // OK
  declare const addOptional: ParameterizedPartial<O>;
  addOptional as {foo?: number, bar?: string, readonly baz?: boolean}; // OK
  addOptional.baz = true; // ERROR
}

// Add readonly parameterized
{
  ({foo: 3, bar: undefined, baz: true} as ParameterizedReadonly<O>);
  declare const readonly: ParameterizedReadonly<O>;
  readonly.foo = 4; // ERROR;
  readonly.bar = 'str'; // ERROR;
  readonly.baz = false; // ERROR;
}

// Non-homomorphic mapped types
{
  ({foo: 3, bar: 3} as MappedNonHomomorphic); // OK!
  ({foo: null, bar: null} as MappedNonHomomorphic); // ERROR!
}

// Semi-homomorphic mapped types
{
  declare const semi: SemiHomomorphic<{readonly foo: number, bar: string}, 'foo'>;
  semi as {readonly foo: number}; // OK
  semi as {foo: number}; // ERROR
}

// Both homomorphic and semi-homomorphic mapped types are distributive
{
  declare const semi: SemiHomomorphic<{readonly foo: number} | {readonly foo: string}, 'foo'>;
  semi as {readonly foo: number} | {readonly foo: string}; // OK!
  semi as {foo: number} | {foo: string}; // ERROR 2x

  declare const homomorphic: ParameterizedReadonly<{foo: number} | {bar:number} >;
  homomorphic as {readonly foo: number} | {readonly bar: number}; // OK!
  homomorphic as {foo: number} | {bar: number}; // ERROR 2x
}
