---
author: Kevin Newton (@kddnewton)
authorURL: https://twitter.com/kddnewton
title: Prettier for Ruby goes v1.0 🎉
---

After 1500 commits and 50 releases since July 2018, we're happy to announce that we've just released v1.0 of [Prettier for Ruby](https://github.com/prettier/plugin-ruby). In this blog post, we'd like to give a short overview of how the plugin works, its philosophy, and what to expect in the future.

<!--truncate-->

## How does it work?

Prettier for Ruby works through Prettier's [plugin API](https://prettier.io/docs/en/plugins.html). Its `parse` function works by spawning a Ruby process and using Ruby's own parser (known as `Ripper`). After tracking all of the various node types, comments, location information, and other various metadata, it returns a built abstract syntax tree (AST) to the Prettier process. Finally it converts that AST into Prettier's intermediate representation (known as `Doc`) before allowing Prettier to handle printing it back out.

## Philosophy

The Ruby plugin attempts to be satisfied with as many varieties of code as possible. For instance, if you decide to a call a method with or without parentheses, the plugin will allow this and honor your selection. For a couple of instances where the Ruby community has entrenched itself into some strong opinions, however, options are provided. These include:

- `rubyArrayLiteral` - By default, the Ruby plugin will convert arrays of simple strings and symbols to their equivalent array literal syntax (`%w` and `%i`, respectively). If you disable this option, it will leave them alone.
- `rubyHashLabel` - This option is for the fans of the hash rocket. By default, the Ruby plugin will print out your hash keys consistently, i.e., it will use labels if it can for every key, otherwise it will use hash rockets for every key. If you disable the default behavior, every key in hashes will always use hash rockets.
- `rubyModifier` - For the users that really dislike the modifier form of `if`, `unless`, `while`, and `until`, this option is for you.
- `rubySingleQuote` - The default behavior is to use single quotes where it makes sense, and otherwise to use double quotes. With this option you can reverse that behavior.
- `rubyToProc` - This option allows Prettier to convert statements like `array.map { |elem| elem.to_s }` to `array.map(&:to_s)`. It is disabled by default because it technically changes the arity of block, which can break reflection code.

The plugin additionally supports various Prettier core options, including:

- `printWidth` - This defaults to 80 characters, but you can make the line longer if you prefer.
- `tabWidth` - This defaults to 2 characters.
- `trailingComma` - This defaults to `"none"`, but you can choose `"all"` to introduce trailing commas into array literals, hash literals, and argument lists that span multiple lines.

In general the style of Prettier will match that of the [Ruby style guide](https://github.com/rubocop-hq/ruby-style-guide), i.e., the default Rubocop configuration. However, while you're using Prettier you might just find that you want to turn off the `Formatting/*` rules from Rubocop anyway as it will speed up your linter runs.

## What's next

Going forward, we're going to be working on a couple of things:

- Support for the new syntax coming out with Ruby 3, including rightward assignment and more pattern matching.
- Better performance, as in [these](https://github.com/kddeisz/libdoc) [experiments](https://github.com/prettier/plugin-ruby/pull/512).
- Support for the Ruby language in Prettier's [playground](https://prettier.io/playground/).
- Support for HTML ERB templates as another plugin, as in this [experiment](https://github.com/prettier/plugin-ruby/compare/erb).

Today, you can try the plugin from the command line by following the [instructions in the README](https://github.com/prettier/plugin-ruby#getting-started). Definitely [report any bugs](https://github.com/prettier/plugin-ruby/issues) that you find, we're working diligently to make sure they're squashed as soon as they come up. Also feel free to [get started contributing](https://github.com/prettier/plugin-ruby/blob/master/CONTRIBUTING.md) to the project itself if you're interested.
