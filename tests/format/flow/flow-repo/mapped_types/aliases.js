// Mapped Type aliases should not participate in the buggy TypeAppT ~> TypeAppT special case
type ReadOnly<O> = {readonly [key in keyof O]: O[key]};
type ReadOnlyDeeper<O> = ReadOnly<O>;
type ReadOnlyDeepest<O> = ReadOnlyDeeper<O>;

type O1 = {foo: number};
type O2 = {foo: string | number};

declare const x: ReadOnly<O1>;
x as ReadOnly<O2>; // OK

declare const y: ReadOnlyDeeper<O1>;
y as ReadOnlyDeeper<O2>; // OK

declare const z: ReadOnlyDeepest<O1>;
z as ReadOnlyDeepest<O2>; // OK
