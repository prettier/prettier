type Contravariant<  in   T  > = T;

type Covariant<  out   T  > = T;

type Mixed<  in   T,   out   U  > = T;

type InNamedIn<  in   in  > = void;

type OutNamedOut<  out   out  > = void;

type InWithBound<  in   T:   number  > = T;

type OutWithDefault<  out   T  =   string  > = T;
