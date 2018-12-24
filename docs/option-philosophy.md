---
id: option-philosophy
title: Option Philosophy
---

Prettier is not a kitchen-sink code formatter that attempts to print your code in any way you wish. It is _opinionated._ Quoting the [Why Prettier?](why-prettier.md) page:

> By far the biggest reason for adopting Prettier is to stop all the on-going debates over styles.

The more options Prettier has, the further from the above goal it gets. **The debates over styles just turn into debates over which Prettier options to use.**

The issue about [resisting adding configuration](https://github.com/prettier/prettier/issues/40) has more 👍s than any option request issue.

So why does Prettier have options at all?

Well, had Prettier been created around the same time as JavaScript itself was born it could have made choices that the community would have picked up (which is the case for [elm-format](https://github.com/avh4/elm-format/)). But JavaScript is far older than Prettier so the community has had time to start their holy wars about tabs vs spaces, single vs double quotes, indentation levels, trailing commas and semicolons, so Prettier more or less has to support those.

Then there's a bunch of interesting cases.

- `--trailing-comma es5` was added to make it easier to use trailing commas in most environments without having to transpile (trailing function commas were added in ES2017).
- `--prose-wrap` is important to support all quirky markdown renderers in the wild.
- `--html-whitespace-sensitivity` is needed due to the unfortunate whitespace rules of HTML.
- `--end-of-line` makes it easier for teams to keep CRLFs out of their git repositories.
- `--arrow-parens` was added after – at the time – [huge demand](https://github.com/prettier/prettier/issues/812). Prettier has to strike a balance between ideal goals and listening to the community.
- `--jsx-single-quote` was also added after [great demand](https://github.com/prettier/prettier/issues/1080), but after more consideration. It took quite some time to figure out the right approach.
- `--jsx-bracket-same-line` was needed for a big company with a huge code base (Facebook), which backed the project when it got started, to be able to [adopt Prettier at all](https://github.com/prettier/prettier/pull/661#issuecomment-295770645).

Finally, perhaps the most interesting of them all is `--bracket-spacing`.
The truth is that not even [Prettier's creator knows exactly why it exists](https://github.com/prettier/prettier/issues/715#issuecomment-281096495). It was added super early on without much thought. It now serves as an example of the types of options we should avoid.

Remember, it is easy to _add_ features to a program, but hard to remove them.
