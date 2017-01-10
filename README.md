# prettier

This is a JavaScript pretty-printer that is opinionated. All it takes
is a width to format the code to and it does the rest. Zero config: it
just works! Integrate this into your editor to get immediate feedback,
or run it across an entire project to format all your files.

## Details

This is a fork of [recast](https://github.com/benjamn/recast)'s
printer because it already handles a lot of edge cases like handling
comments. The core algorithm has been rewritten to be based on
Wadler's "[A prettier
printer](http://homepages.inf.ed.ac.uk/wadler/papers/prettier/prettier.pdf)"
paper, however. Recast also supported only re-printing nodes that
changed from a transformation, but we avoid that and always
pretty-print the entire AST so it's always consistent.

That paper allows a flexible formatting that will break expressions
across lines if they get too big. This means you can sloppily write
code as you need and just format it, and it will always produce
consistent output.

The core of the algorithm is implemented in `pp.js`. The printer should
use the basic formatting abstractions provided to construct a format
when printing a node. Parts of the API only exist to be compatible
with recast's previous API to ease migration, but over time we can
clean it up.

The following commands are available:

* **concat**

Combine an array into a single string.

* **group**

Mark a group of items which the printer should try to fit on one line.
This is the basic command to tell the printer when to break. Groups
are usually nested, and the printer will try to fit everything on one
line, but if it doesn't fit it will break the outermost group first
and try again. It will continue breaking groups until everything fits
(or there are no more groups to break).

* **multilineGroup**

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

* **join**

Join an array of items with a separator.

* **line**

Specify a line break. If an expression fits on one line, the line
break will be replaced with a space. Line breaks always indent the
next line with the current level of indentation.

* **softline**

Specify a line break. The difference from `line` is that if the
expression fits on one line, it will be replaced with nothing.

* **hardline**

Specify a line break that is **always** included in the output, no
matter if the expression fits on one line or not.

* **literalline**

Specify a line break that is **always** included in the output, and
don't indent the next line. This is used for template literals.

* **indent**

Increase the level of indentation.

### Example

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

## TODO

There is a lot to do:

1. Most importantly, finish the migration of recast's printing. Many
node types have not been converted from recast's old ways of doing
things, so need to finish converting them. The easiest way to do this
is search for `\n` in the printer; there should be no uses of it
because we use `line` instead. For example see
[`DoWhileStatement`](https://github.com/jlongster/jscodefmt/blob/master/src/printer.js#L928).
2. Remove any cruft leftover from recast that we don't need
3. Polish the API (it was currently designed to be "usable" and compatible with what recast did before)
4. Better editor integration
5. Better CLI

## Contributing

```
$ git clone https://github.com/jlongster/jscodefmt.git
$ cd jscodefmt
$ npm install
$ ./bin/jscodefmt file.js
```

## Tests

A few snapshot tests are currently implemented. See `tests`. To run
the tests simply run `npm test` in the root directory.

## Editors

It's most useful when integrated with your editor, so see `editors` for
editor support. Atom and Emacs is currently supported.

More docs on editor integration will come soon. To integrate in Emacs,
add the following code. This will format the file when saved.

```elisp
(require 'jscodefmt)
(add-hook 'js-mode-hook
          (lambda ()
            (add-hook 'before-save-hook 'jscodefmt-before-save)))
```
