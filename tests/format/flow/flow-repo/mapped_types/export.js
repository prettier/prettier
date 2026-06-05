type O = {foo: number, bar?: string, readonly baz: boolean};

export type MappedO = {[key in keyof O]: O[key]};
export type AddOptional = {[key in keyof O]?: O[key]};
export type AllReadonly = {readonly [key in keyof O]: O[key]};

export type ParameterizedId<O extends {...}> = {[key in keyof O]: O[key]};
export type ParameterizedPartial<O extends {...}> = {[key in keyof O]?: O[key]};
export type ParameterizedReadonly<O extends {...}> = {readonly [key in keyof O]: O[key]};

export type MappedNonHomomorphic = {[key in 'foo' | 'bar']: number};

export type SemiHomomorphic<O extends {...}, Keys extends keyof O> = {[key in Keys]: O[key]};
