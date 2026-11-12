// prettier-ignore
for (;;) function retained(  );
{ const live = 1; }

// prettier-ignore
if (condition) function consequent(  ); else function alternate(  );
{ const live = 2; }

// prettier-ignore
for (;;) if (condition) while (other) label: function nested(  );
{ const live = 3; }

// prettier-ignore
if (condition) function nonterminal(  ); else {}
{ const live = 4; }

// prettier-ignore
do function doWhile(  ); while (condition);
{ const live = 5; }

// prettier-ignore
namespace Scoped { export function scoped(  ); }
{ const live = 6; }
