// Every string will be changed to double quotes, unless we end up with fewer
// escaped quotes by using single quotes. (Vice versa if the "singleQuote"
// option is true).
//
// Note that even if a string already has the correct enclosing quotes, it is
// still processed in order to remove unnecessarily escaped quotes within it,
// for consistency.

// Simple strings.
"abc"
'abc'

// Escape.
'\0'

// Emoji.
'🐶'

// Empty string.
""
''

// Single double quote.
"\""
'"'

// Single single quote.
"'"
'\''

// Unnecessary escapes.
"\'"
'\"'

// One of each.
"\"'"
'"\''

// One of each with unnecessary escapes.
"\"\'"
'\"\''

// More double quotes than single quotes.
"\"'\""
'"\'"'

// More single quotes than double quotes.
"\"''"
'"\'\''

// Two of each.
"\"\"''"
'""\'\''

// Single backslash.
'\\'
"\\"

// Backslases.
"\"\\\"\\\\\" '\'\\'\\\'\\\\'"
'\'\\\'\\\\\' "\"\\"\\\"\\\\"'

// Somewhat more real-word example.
"He's sayin': \"How's it goin'?\" Don't ask me why."
'He\'s sayin\': "How\'s it goin\'?" Don\'t ask me why.'

// Somewhat more real-word example 2.
"var backslash = \"\\\", doubleQuote = '\"';"
'var backslash = "\\", doubleQuote = \'"\';'
