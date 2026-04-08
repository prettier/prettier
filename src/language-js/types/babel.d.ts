import type * as Babel from "@babel/types";

export type * from "@babel/types";
export type Node = Exclude<Babel.Node, Babel.TupleTypeAnnotation>;
