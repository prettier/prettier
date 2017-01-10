# Prettier

Prettier is an opinionated JavaScript formatter inspired by
[refmt](https://facebook.github.io/reason/tools.html). It removes all
original styling and ensures that all outputted JavaScript conforms to
a consistent style.

*Warning*: This is a beta, but should solidify fairly quickly.

This goes way beyond [eslint](http://eslint.org/) and other projects
[built on it](https://github.com/feross/standard). Unlike eslint,
there aren't a million configuration options and rules. But more
importantly: **everything is fixable**. This works because prettier
never "checks" anything; it takes JavaScript as input and outputs the
formatted JavaScript as output.

In technical terms: prettier parses your JavaScript into an AST and
pretty-prints the AST, completely ignoring any of the original
formatting. Say hello to completely consistent syntax!

There's an extremely important piece missing from existing styling
tools: **the maximum line length**. Sure, you can tell eslint to warn
you when you have a line that's too long, but that's an after-thought
(eslint *never* knows how to fix it). The maximum line length is a
critical piece the formatter needs for laying out and wrapping code.

For example, take the following code:

```js
foo(arg1, arg2, arg3);
```

That looks like the right way to format it. However, we've all run
into this situation:

```js
foo(reallyLongArg(), omgSoManyParameters(), IShouldRefactorThis(), isThereSeriouslyAnotherOne());
```

Suddenly our previous format for calling function breaks down because
this is too long. What you would probably do is this instead:

```
foo(
  reallyLongArg(),
  omgSoManyParameters(),
  IShouldRefactorThis(),
  isThereSeriouslyAnotherOne()
);
```

This clearly shows that the maximum line length has a direct impact on
the style of code we desire. The fact that current style tools ignore
this means they can't really help with the situations that are
actually the most troublesome. Individuals on teams will all format
these differently according to their own rules and we lose the
consistency we sought after.

Even if we disregard line widths, it's too easy to sneak in various
styles of code in all other linters. The most strict linter I know
happily lets all these styles happen:

```js
foo({ num: 3 },
  1, 2)

foo(
  { num: 3 },
  1, 2)

foo(
  { num: 3 },
  1,
  2
)
```

Prettier bans all custom styling by parsing it away and re-printing
the parsed AST with its own rules that take the maximum line width
into account, wrapping code when necessary.

## Usage

Install:

```
npm install [-g] prettier
```

You can install it globally if you like.

### CLI

Run prettier through the CLI with this script. Run it without any
arguments to see the options.

```js
prettier <opts> <filename>
```

### API

The API is a single function exported as `format`. The options
argument is optional, and all of the defaults are shown below:

```js
const prettier = require("prettier");

prettier.format(source, {
  // Fit code within this line limit
  printWidth: 80,

  // Number of spaces it should use per tab
  tabWidth: 2

  // Use the flow parser instead of babylon
  useFlowParser: false,

  // If true, will use single instead of double quotes
  singleQuote: false,

  // Controls the printing of trailing commas wherever possible
  trailingComma: false,

  // Controls the printing of spaces inside array and objects
  bracketSpacing: true
});
```

### Atom

Atom users can simply install the `prettier-atom` package and use
ctrl+alt+f to format a file (or format on save if turned on).

### Emacs

Emacs users should see [this
folder](https://github.com/jlongster/prettier/tree/master/editors/emacs)
for on-demand formatting.

More editors are coming soon.

## Technical Details

This printer is a fork of
[recast](https://github.com/benjamn/recast)'s printer with it's
algorithm replaced by the one described by Wadler in "[A prettier
printer](http://homepages.inf.ed.ac.uk/wadler/papers/prettier/prettier.pdf)".
There still may be leftover code from recast that needs to be cleaned
up.

The basic idea is that the printer takes an AST and returns an
intermediate representation of the output, and the printer uses that
to generate a string. The advantage is that the printer can "measure"
the IR and see if the output is going to fit on a line, and break if
not.

This means that most of the logic of printing an AST involves
generating an abstract representation of the output involving certain
commands. For example, `concat(["(", line, arg, line ")"])` would
represent a concatentation of opening parens, an argument, and closing
parens. But if that doesn't fit on one line, the printer can break
where `line` is specified.

More (rough) details can be found in [commands.md](commands.md).
Better docs will come soon.

## Contributing

We will work on better docs over time, but in the mean time, here are
a few notes if you are interested in contributing:

* You should be able to get up and running with just `npm install`
* This uses jest snapshots for tests. The entire Flow test suite is
  included here and you can make changes and run `jest -u` and then
  `git diff` to see the styles that changed. Always update the
  snapshots if opening a PR.
* If you can, look at [commands.md](commands.md) and check out
  [Wadler's
  paper](http://homepages.inf.ed.ac.uk/wadler/papers/prettier/prettier.pdf)
  to understand how this works. I will try to write a better explanation soon.
* I haven't set up any automated tests yet, but for now as long as you
  run `jest -u` to update the snapshots and I see them in the PR, that's fine.
* You can run `AST_COMPARE=1 jest` for a more robust test run. That
  formats each file, re-parses it, and compares the new AST with the
  original one and makes sure they are semantically equivalent.