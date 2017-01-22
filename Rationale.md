# Rationale

Prettier is an opinionated JavaScript formatter and this document gives a rationale behind those opinions.

## What is prettier concerned about

### Correctness

The first goal of prettier is to output valid JavaScript and code that has the exact same behavior as the one it is formatting. Please report any JavaScript code that doesn't respect those correctness rules, they are bugs that need to be fixed!


### Whitespaces: indentation and new lines

This is the core of prettier. The formatting rules are going to be explained in a later section.


### Semi-colons

...TBD...


### Strings

There is a setting in prettier to decide which types of quotes to use, either single or double. Prettier is going to enforce those. There are two exceptions:

- Prettier will minimize the number of escape needed when there are quotes of the same type. For example, if your quote setting is single and you have a string with a single quote inside, it is going to use a double enclosing quote: `"that's a double quote"`.
- JSX always use double quotes. JSX takes its roots from HTML where the dominant use of quotes for attributes are double quotes. You can see this as the Chrome Inspector displays html as double quotes no matter how they were first created.

Prettier is going to maintain the way your string was escaped. This means that unicode characters like emojis will remain either as emoji or escaped depending on how they were in the original source.


### Parenthesis

Prettier is going to output the minimum number of parenthesis that ensures that the formatted code has the same behavior as the previous one. It may lead to code that feels ambiguous. If that's the case, you are encouraged to extract out the ambiguous parts into variables.


### Empty lines

It turns out that empty lines are very hard to automatically generate. The approach that prettier takes is to preserve empty lines the way they were inputted in the original source code. The only constraint is that prettier will no allow more than a single empty line, if they are more, they will be turned into a single one.


## What is prettier NOT concerned about

Outside of points mentionned above, prettier does not have an opinion on the way your code is written. The following non-exhaustive requests are out of scope for prettier.

- Turning single/double quotes into template literals or vis-versa.
- Adding `{}` and `return` around places where they are optional
- Turning `?:` into `if then else`

## Formatting rules

... TBD ...

### Function calls

### Method calls

### JSX

### Boolean expressions

### String concatenation


