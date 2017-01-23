# Rationale

Prettier is an opinionated JavaScript formatter. This document gives a rationale behind those opinions.


## What prettier is concerned about

### Consistency

Prettier exists for one purpose: to enforce consistency across your entire project. Not only do we output code with consistent whitespace, prettier will lay out code according to a wrapping algorithm based on a maximum line width. That means that long expressions will be broken up across lines, removing the need for manual layout from the programmer which inevitably leads to inconsistency.

### Correctness

The first requirement of prettier is to output valid JavaScript and code that has the exact same behavior as before formatting. Please report any JavaScript code where prettier fails to follow these correctness rules — that's a bug which needs to be fixed!


### Whitespace: indentation and line breaks

This is the core of prettier. The formatting rules are going to be explained in a later section.


### Semi-colons

...TBD...


### Strings

Prettier enforces double quotes by default, but has a setting for enforcing single quotes instead. There are two exceptions:

- The number of escaped quotes are minimized. For example, if you have a string with a single quote inside, it will be enclosed in double quotes regardless of the quote setting: `"that's a double quote"`, not `'that\'s a double quote'`.
- JSX always uses double quotes. JSX takes its roots from HTML, where the dominant use of quotes for attributes is double quotes. Browser developer tools also follow this convention by always displaying HTML with double quotes, even if the source code uses single quotes.

Prettier maintains the way your string is escaped. For example, `"🙂"` won't be formatted into `"\uD83D\uDE42"` and vice versa.


### Parentheses

Prettier outputs the minimum number of parentheses required to ensure that the behavior of the formatted code stays unchanged. This may lead to code that feels ambiguous. If that's the case, you are encouraged to extract the ambiguous parts into variables.


### Empty lines

It turns out that empty lines are very hard to automatically generate. The approach that prettier takes is to preserve empty lines the way they were in the original source code. The only constraint is that prettier disallows several empty lines in a row. They are collapsed to a single one.


## What prettier is _not_ concerned about

Here are a few examples of things that are out of scope for prettier:

- Turning single/double quotes into template literals or vice versa.
- Adding/removing `{}` and `return` where they are optional.
- Turning `?:` into `if then else`.


## Formatting rules

... TBD ...


### Function calls


### Method calls


### JSX


### Boolean expressions


### String concatenation
