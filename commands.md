
This is very rough documentation of the formatting commands you can
use to build a printed version of something. This will be improved
over time.

The core of the algorithm is implemented in `doc-{printer,builders,utils}.js`. The printer should
use the basic formatting abstractions provided to construct a format
when printing a node. Parts of the API only exist to be compatible
with recast's previous API to ease migration, but over time we can
clean it up.

The following commands are available:

### concat

Combine an array into a single string.

### group

Mark a group of items which the printer should try to fit on one line.
This is the basic command to tell the printer when to break. Groups
are usually nested, and the printer will try to fit everything on one
line, but if it doesn't fit it will break the outermost group first
and try again. It will continue breaking groups until everything fits
(or there are no more groups to break).

### multilineGroup

This is the same as `group`, but with an additional behavior: if this
group spans any other groups that have hard breaks (see below) this
group *always* breaks. Otherwise it acts the same as `group`.

For example, an array will try to fit on one line:

```js
[1, "foo", { bar: 2 }]
```

However, if any of the items inside the array have a hard break, the
array will *always* break as well:

```js
[
  1,
  function() {
    return 2
  },
  3
]
```

Functions always break after the opening curly brace no matter what,
so the array breaks as well for consistent formatting. See the
implementation of `ArrayExpression` for an example.

### join

Join an array of items with a separator.

### line

Specify a line break. If an expression fits on one line, the line
break will be replaced with a space. Line breaks always indent the
next line with the current level of indentation.

### softline

Specify a line break. The difference from `line` is that if the
expression fits on one line, it will be replaced with nothing.

### hardline

Specify a line break that is **always** included in the output, no
matter if the expression fits on one line or not.

### literalline

Specify a line break that is **always** included in the output, and
don't indent the next line. This is used for template literals.

### indent

Increase the level of indentation.

## Example

For an example, here's the implementation of the `ArrayExpression` node type:

```js
return multilineGroup(concat([
  "[",
  indent(options.tabWidth,
         concat([
           line,
           join(concat([",", line]),
                path.map(print, "elements"))
         ])),
  line,
  "]"
]));
```

This is a group with opening and closing brackets, and possibly
indented contents. Because it's a `multilineGroup` it will always be
broken up if any of the sub-expressions are broken.
