enum F // comment
{ A }

declare enum Declared // declared
{ A }

export const enum Exported // exported
{ A }

enum Empty // empty
{}

enum OwnLine
// own line
{ A }

enum Multiple // first
// second
{ // inside
  A, // member
  B
} // after

enum Mixed // first
/* second */ /* third */
{ A }

enum BlockThenLine /* first */
// second
{ A }

enum MixedEmpty // first
/* second */
{}

enum FirstEntryIgnored // header
{ // prettier-ignore
  A=1    +    2,B=3+4
}

enum HeaderIgnore /* prettier-ignore */ // ordinary
{ A=1    +    2,B=3+4 }

enum Inline /* inline */ { A }

enum EndOfLineBlock /* block */
{ A }

enum // keyword
Keyword { A }

// leading
enum Leading { A }

enum BodyComment { // body
  A
}

enum InitializerComment { A = 1 // initializer
  + 2 }

// prettier-ignore
enum Ignored // header
{A=1    +    2,B=3+4}
