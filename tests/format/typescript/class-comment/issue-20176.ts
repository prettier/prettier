class OwnLine extends Base
// own line
<Type> {}

class EndOfLine extends Base // end of line
<Type> {}

const Expression = class extends ns.Base
// expression
<Type> {};

class Multiple extends Base
// first
// second
<Type> {}

class Qualified extends ns.Base // qualified
<Type> implements Interface {}

class Block extends Base /* block */ <Type> {}

class BeforeBody extends Base<Type>
// body
{}

class After extends Base<Type> {} // after
