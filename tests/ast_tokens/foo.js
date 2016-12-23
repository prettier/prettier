// Regex literals require a lexer mode change
/asdf/g;

// JSX also requires a lexer mode change
<div attr1='42' attr2={'asdf'} >asdf</div>;

// Async arrow functions require backtracking
var a = async () => 42;

// Type annotations have a special lex mode
var a: number = 42;

// Token stream should continue even with parse errors
var var
a;
