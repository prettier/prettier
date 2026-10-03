namespace F // comment
{ a; }

declare namespace Declared // declared
{ const a: number; }

export namespace Exported // exported
{ export const a = 1; }

declare module "external" // external
{ export const a: number; }

namespace Qualified.Name // qualified
{ export const a = 1; }

namespace Outer {
  namespace Inner // inner
  { a; }
}

namespace Empty // empty
{}

namespace EmptyStatements // empty statements
{ ; ; }

namespace OwnLine
// own line
{ a; }

namespace Multiple // first
// second
{ // inside
  a; // statement
  b;
} // after

namespace Mixed // first
/* second */ /* third */
{ a; }

namespace BlockThenLine /* first */
// second
{ a; }

namespace MixedEmpty // first
/* second */
{}

namespace FirstEntryIgnored // header
{ // prettier-ignore
  a(1    +    2);b(3+4);
}

namespace HeaderIgnore /* prettier-ignore */ // ordinary
{ a(1    +    2);b(3+4); }

namespace EmptyBeforeStatement // header
{ ; ; const a=1+2; }

namespace Inline /* inline */ { a; }

namespace EndOfLineBlock /* block */
{ a; }

// leading
namespace Leading { a; }

namespace BodyComment { // body
  a;
}

declare module "bodyless"; // after

// prettier-ignore
namespace Ignored // header
{a(1    +    2);b(3+4);}
