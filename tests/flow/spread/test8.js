/* Test to ensure that spreads of intersections wait until every member is
 * resolved before the spread resolves to a result. */

type O = A & B;
declare var o: O;
({ ...o }: { p: number, q: string }); // OK
({ ...o }: { p: number, q: number }); // error: string ~> number (prop q)
({ ...o }: { p: string, q: string }); // error: number ~> string (prop p)

// types declared below, so they resolve after the spread is processed
type A = { p: number };
type B = { q: string };
