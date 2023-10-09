---
author: "Alex Rattray (@rattrayalex)"
authorURL: "https://github.com/rattrayalex"
title: "A curious case of the ternaries"
---

_For a quick tl;dr, [see the release post](/blog/2023/10/01/3.1.0)._

<!-- truncate -->

Printing nested ternaries nicely in a wide variety of scenarios is a surprisingly tricky challenge.

Prettier's original, naïve approach – just add indentation to each level of a nested ternary – worked fine in simple cases, but didn't scale to deeply nested ternaries and [had other problems](https://github.com/prettier/prettier/issues/737).

So in 2018, we [replaced that with flat ternaries](https://github.com/prettier/prettier/pull/5039), which [seemed](https://github.com/prettier/prettier/pull/4767#issuecomment-401764876) like a good idea at the time, but was [not received well](https://github.com/prettier/prettier/issues/5814) – the issue asking it to be reverted has well over 500 upvotes.

Over the last few years, we [explored](https://github.com/prettier/prettier/issues/9561) and experimented with many, many possible solutions which would be as readable as nested ternaries in common cases, but also scale to work well in a wider variety of situations.

Ideally, we'd find one scheme that would fluidly flow from a single ternary, to a chain of 2, to a long chain of simple cases, to something more complex with a few nested conditions. The syntax in JSX, TypeScript conditional expressions (which cannot be expressed with `if`), and normal JS should all look and feel the same. And in all cases, it should be easy to follow what's the "if", what's the "then", and what's the "else" – and what they map to.

The good news is that we found it. The bad news is that it's novel, and thus unfamiliar to most developers.

In beta testing this feature, we found developers were quite skeptical when they first saw it:

!["I'm not convinced the new version is simpler to read here."](https://user-images.githubusercontent.com/704302/205551054-122f2fc0-fee3-4254-912a-1b97b5cf0c04.png)

But then, after using it for a bit, they didn't want to go back:

!["I'm liking the ternaries! I think it makes sense to have them formatted like this. I also got used to them quite quickly as well. \nI agree with this, it takes a very short time to get used to it."](https://user-images.githubusercontent.com/704302/205550887-b780f6ba-b678-4620-a454-255bd5083096.png)

Another developer had this to say:

> My first hour with the rule on, it felt a little odd. But by hour two, I’d used it a few times to solve problems that otherwise would have been ugly refactors to if statements. I’m not going back.

> I used to hate nested ternaries, but I also hate restructuring a nice line of code into if-else statements. The new rule adds an understandable, linear if-else if-else expression to the language and is much nicer than multiple ternaries as nested branches.

So we felt we had a winning formula, but it could be a jarring introduction to the community.

As a result, we decided to put this new formatting behind a temporary `--experimental-ternaries` option for a few months, and in the meantime go ahead and ship what the community has been clammering for: [indented ternaries](https://github.com/prettier/prettier/pull/9559).

So what does this new style look like, anyway?

Here's a quick, contrived example to show the thinking behind "curious" ternaries:

<!-- prettier-ignore -->
```ts
const animalName =
  pet.canBark() ?
    pet.isScary() ?
      'wolf'
    : 'dog'
  : pet.canMeow() ?
    'cat'
  : 'probably a bunny';
```

1. Every line that ends with a question mark is an **"if"**.
   - If you see `foo ?` it's like asking a question about foo – "if foo? then, …".
2. Every line that starts with a `:` is an **"else"**.
   - If you see `: foo` that means, "else, foo".
   - If you see `: foo ?` that means "else, if foo?".
3. Every line without `:` or `?` is a **"then"**.
   - If you just see `foo`, that means, "then foo".

And here's the code rewritten to show "case-style" ternaries:

<!-- prettier-ignore -->
```ts
const animalName =
  pet.isScary() ? 'wolf'
  : pet.canBark() ? 'dog'
  : pet.canMeow() ? 'cat'
  : 'probably a bunny';
```

You can see this is a nice concise way to get something approaching `match`-style syntax in JavaScript, with just the humble ternary operator (albeit missing several features).

Our new formatting is a fluid blend of "curious" ternaries (where the question mark is always at the end of the line), and "case-style" ternaries, where the question mark is in the middle of the line.

For example:

<!-- prettier-ignore -->
```ts
const animalName =
  pet.canSqueak() ? 'mouse'
  : pet.canBark() ?
    pet.isScary() ?
      'wolf'
    : 'dog'
  : pet.canMeow() ? 'cat'
  : pet.canSqueak() ? 'mouse'
  : 'probably a bunny';
```

## Give us your feedback!

We hope you like the more readable new default, and we **really** hope you give the new `--experimental-ternaries` option a try for a few weeks and let us know what you think.

Please give us feedback via Google Forms: https://forms.gle/vwEuboCobTVhEkt66
