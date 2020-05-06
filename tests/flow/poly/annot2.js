import {f, g} from "./annot1";

(f(0)(1): number); // errors: number ~> T (empty), T (mixed) ~> number
(g(0)(1): number); // ok
