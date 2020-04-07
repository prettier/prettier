---
id: option-philosophy
title: Option Philosophy
---

> Prettier has a few options because of history. **But we don’t want more of them.**
>
> Read on to learn more.

Prettier is not a kitchen-sink code formatter that attempts to print your code in any way you wish. It is _opinionated._ Quoting the [Why Prettier?](why-prettier.md) page:

> By far the biggest reason for adopting Prettier is to stop all the on-going debates over styles.

The more options Prettier has, the further from the above goal it gets. **The debates over styles just turn into debates over which Prettier options to use.**

The issue about [resisting adding configuration](https://github.com/prettier/prettier/issues/40) has more 👍s than any option request issue.

So why are there any options at all?

- A few were added during Prettier’s infancy to make it take off at all. 🚀
- A couple were added after “great demand.” 🤔
- Some were added for compatibility reasons. 👍

What we’ve learned during the years is that it’s really hard to measure demand. Prettier has grown _a lot_ in usage. What was “great demand” back in the day is not as much today. How many is many? What about all silent users?

It’s so easy to add “just one more“ option. But where do we stop? When is one too many? There will always be a “top issue” in the issue tracker. Even if we add just that one final option.

The downside of options is that they open up for debate within teams. Which options should we use? Why? Did we make the right choices?

Every option also makes it much harder to say no to new ones. If _those_ options exist, why can’t this one?

We’ve had several users open up option requests only to close them themselves a couple of months later. They had realized that they don’t care at all about that little syntax choice they used to feel so strongly about. Examples: [#3101](https://github.com/prettier/prettier/issues/3101#issuecomment-500927917) and [#5501](https://github.com/prettier/prettier/issues/5501#issuecomment-487025417).

All of this makes the topic of options in Prettier very difficult. And mentally tiring for maintainers. What do people want? What do people _really_ want in 6 months? Are we spending time and energy on the right things?

Some options are easier to motivate:

- `--trailing-comma es5` lets you use trailing commas in most environments without having to transpile (trailing function commas were added in ES2017).
- `--prose-wrap` is important to support all quirky markdown renderers in the wild.
- `--html-whitespace-sensitivity` is needed due to the unfortunate whitespace rules of HTML.
- `--end-of-line` makes it easier for teams to keep CRLFs out of their git repositories.
- `--quote-props` is important for advanced usage of the Google Closure Compiler.

But others are harder to motivate in hindsight, and usually end up with bike shedding. `--arrow-parens`,
`--jsx-single-quote`, `--jsx-bracket-same-line` and `--no-bracket-spacing` are not the type of options we want more of. They exist (and are difficult to remove now), but should not motivate adding more options like them.

Feel free to open issues! Prettier isn’t perfect. Many times things can be improved without adding options. But if the issue _does_ seem to need a new option, we’ll generally keep it open, to let people 👍 it and add comments.
