---
id: rationale
title: Rationale
---

Prettier is an opinionated code formatter. This document explains some of its choices.

## What Prettier is concerned about

### Correctness

The first requirement of Prettier is to output valid code that has the exact same behavior as before formatting. Please report any code where Prettier fails to follow these correctness rules — that's a bug which needs to be fixed!

### Strings

Double or single quotes? Prettier chooses the one which results in the fewest number of escapes. `"It's gettin' better!"`, not `'It\'s gettin\' better!'`. In case of a tie, Prettier defaults to double quotes (but that can be changed via the [singleQuote](options.html#quotes) option).

JSX always uses double quotes. JSX takes its roots from HTML, where the dominant use of quotes for attributes is double quotes. Browser developer tools also follow this convention by always displaying HTML with double quotes, even if the source code uses single quotes.

Prettier maintains the way your string is escaped. For example, `"🙂"` won't be formatted into `"\uD83D\uDE42"` and vice versa.

### Empty lines

It turns out that empty lines are very hard to automatically generate. The approach that Prettier takes is to preserve empty lines the way they were in the original source code. There are two additional rules:

- Prettier collapses multiple blank lines into a single blank line.
- Empty lines at the start and end of blocks (and whole files) are removed. (Files always end with a single newline, though.)

### Multi-line objects

By default, Prettier’s printing algorithm prints expressions on a single line if they fit. Objects are used for a lot of different things in JavaScript, though, and sometimes it really helps readability if they stay multiline. See [object lists], [nested configs], [stylesheets] and [keyed methods], for example. We haven't been able to find a good rule for all those cases, so Prettier instead keeps objects multiline if there's a newline anywhere inside it in the original source code. A consequence of this is that long singleline objects are automatically expanded, but short multiline objects are never collapsed.

[object lists]: https://github.com/prettier/prettier/issues/74#issue-199965534
[nested configs]: https://github.com/prettier/prettier/issues/88#issuecomment-275448346
[stylesheets]: https://github.com/prettier/prettier/issues/74#issuecomment-275262094
[keyed methods]: https://github.com/prettier/prettier/pull/495#issuecomment-275745434

### Semicolons

This is about using the `--no-semi` option.

Consider this piece of code:

<!-- prettier-ignore -->
```js
if (shouldAddLines) {
  [-1, 1].forEach(delta => addLine(delta * 20))
}
```

While the above code works just fine without semicolons, Prettier actually turns it into:

<!-- prettier-ignore -->
```js
if (shouldAddLines) {
  ;[-1, 1].forEach(delta => addLine(delta * 20))
}
```

This is to help you avoid mistakes. Imagine adding this line:

```diff
 if (shouldAddLines) {
+  console.log('Do we even get here??')
   [-1, 1].forEach(delta => addLine(delta * 20))
 }
```

Oops! The above actually means:

<!-- prettier-ignore -->
```js
if (shouldAddLines) {
  console.log('Do we even get here??')[-1, 1].forEach(delta => addLine(delta * 20))
}
```

With a semicolon in front of that `[` such issues never happen. It makes the line independent of other lines so you can move and add lines without having to think about ASI rules.

This practice is also common in [standard] which uses a semicolon-free style.

[standard]: https://standardjs.com/rules.html#semicolons

### Imports

Prettier can break long `import` statements across several lines:

```js
import {
  CollectionDashboard,
  DashboardPlaceholder
} from "../components/collections/collection-dashboard/main";
```

The following example doesn't fit within the print width, but Prettier prints it in a single line anyway:

```js
import { CollectionDashboard } from "../components/collections/collection-dashboard/main";
```

This might be unexpected by some, but we do it this way since it was a common request to keep `import`s with single elements in a single line. The same applies for `require` calls.

### JSX

Prettier prints things a little differently compared to other JS when JSX is involved:

```jsx
function greet(user) {
  return user
    ? `Welcome back, ${user.name}!`
    : "Greetings, traveler! Sign up today!";
}

function Greet({ user }) {
  return (
    <div>
      {user ? (
        <p>Welcome back, {user.name}!</p>
      ) : (
        <p>Greetings, traveler! Sign up today!</p>
      )}
    </div>
  );
}
```

There are two reasons.

First off, lots of people already wrapped their JSX in parentheses, especially in `return` statements. Prettier follows this common style.

Secondly, [the alternate formatting makes it easier to edit the JSX](https://github.com/prettier/prettier/issues/2208). It is easy to leave a semicolon behind. As opposed to normal JS, a leftover semicolon in JSX can end up as plain text showing on your page.

```jsx
<div>
  <p>Greetings, traveler! Sign up today!</p>; {/* <-- Oops! */}
</div>
```

## What Prettier is _not_ concerned about

Prettier only _prints_ code. It does not transform it. This is to limit the scope of Prettier. Let's focus on the printing and do it really well!

Here are a few examples of things that are out of scope for Prettier:

- Turning single- or double-quoted strings into template literals or vice versa.
- Adding/removing `{}` and `return` where they are optional.
- Turning `?:` into `if`-`else` statements.
- Sorting and hoisting `import`s. (Sorting is unsafe because of side effects, which would violate the [correctness](#correctness) goal.)
