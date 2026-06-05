// This test checks ensures that we resolve TypeAppTs, KeysT, EvalTs, etc
// before trying to construct the mapped type.

type Mapped<T> = {[key in T]: number};

{
  type TypeApp<T> = T;
  type MappedTypeApp = Mapped<TypeApp<'foo'>>;
  declare const mappedTypeApp: MappedTypeApp;
  mappedTypeApp as empty; // ERROR
  mappedTypeApp as {foo: number}; // OK!
}

{
  type Keys = keyof {foo: number};
  type MappedKeys = Mapped<Keys>;
  declare const mappedKeys: MappedKeys;
  mappedKeys as empty; // ERROR
  mappedKeys as {foo: number}; // OK!
}

{
  type O = {foo: 'foo'};
  type Eval = O['foo'];
  type MappedEval = Mapped<Eval>;
  declare const mappedEval: MappedEval;
  mappedEval as empty; // ERROR
  mappedEval as {foo: number};
}
