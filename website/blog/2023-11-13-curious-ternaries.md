---
authors: "rattrayalex"
title: "A curious case of the ternaries"
---

Ternary formatting has always been a challenge, and we're finally addressing it in v3.1.0 with the introduction of a novel formatting style.

Read on for our journey and the motivation behind this change, along with early developer feedback and an overview of the "curious ternaries" style.

Please give the `--experimental-ternaries` option a try and let us know what you think!

_For a quick tl;dr, [see the release post](/blog/2023/11/13/3.1.0)._

<!-- truncate -->

## Introduction

Formatting nested ternaries nicely in a wide variety of scenarios is a surprisingly tricky challenge.

Developers have long found them so confusing to read that they end up just refactoring their code to an ugly series of `if`-`else` statements, often with a `let` declaration, an iife, or a separate function entirely.

According to beta testers, the new formatting style we've developed can take some getting used to, but ultimately allows ternaries to be practically used as a concise form of `if`-`else`-expressions in modern codebases.

## Historical background

Prettier's original, naïve approach – just add indentation to each level of a nested ternary – worked fine in simple cases, but obviously doesn't scale to long chains of nested ternaries and [had other problems](https://github.com/prettier/prettier/issues/737).

So in 2018, we [replaced that with flat ternaries](https://github.com/prettier/prettier/pull/5039), which [seemed](https://github.com/prettier/prettier/pull/4767#issuecomment-401764876) like a good idea at the time, but was [not received well](https://github.com/prettier/prettier/issues/5814) – the issue asking it to be reverted had well over 500 upvotes.

While we did ultimately [revert back to indented ternaries](https://github.com/prettier/prettier/pull/9559), we wanted to find a better way.

Over the last few years, we [explored](https://github.com/prettier/prettier/issues/9561) and experimented with many, many possible solutions which would be as readable as indented ternaries in common cases, but also scale to work well in a wider variety of situations.

## Challenging criteria

Ideally, we'd find one scheme that would meet our criteria:

1. In all cases, it should be easy to follow "what's the `if`", "what's the `then`", and "what's the `else`" – and what they map to.
2. The code should fluidly flow from a single ternary, to a chain of 2, to a long chain of simple cases, to something more complex with a few nested conditions. (Most alternatives we explored failed this test).
3. The syntax in JSX, TypeScript conditional expressions (which cannot be expressed with `if`), and normal JS should all look and feel the same.
4. It should scale to nested ternary chains of arbitrary length (imagine a TypeScript conditional type with dozens of alternative cases).

Indented ternaries clearly [failed (4)](https://github.com/prettier/prettier/pull/9559#issuecomment-720736156), arguably (1), and even (3) – we have almost always printed JSX ternaries in a flat-but-readable format that unfortunately [felt unnatural](https://github.com/prettier/prettier/pull/9552) outside of JSX.

Many people in the community were excited about a "case-style", drawing inspiration from the `match` syntax from languages like Rust or OCaml, but it did not meet (2) and [other goals](https://github.com/prettier/prettier/issues/9561#goals:~:text=on%20that%20below.-,Goals,-I%27d%20like%20to).

## A surprising solution

The good news is that we found a formatting algorithm that met our criteria. The bad news is that it's novel, and thus unfamiliar to most developers.

In beta testing this feature, we found developers were quite skeptical when they first saw it:

!["I'm not convinced the new version is simpler to read here."](https://user-images.githubusercontent.com/704302/205551054-122f2fc0-fee3-4254-912a-1b97b5cf0c04.png)

But then, after using it for a bit, they didn't want to go back:

!["I'm liking the ternaries! I think it makes sense to have them formatted like this. I also got used to them quite quickly as well. \nI agree with this, it takes a very short time to get used to it."](https://user-images.githubusercontent.com/704302/205550887-b780f6ba-b678-4620-a454-255bd5083096.png)

Another developer had this to say:

> My first hour with the rule on, it felt a little odd. But by hour two, I’d used it a few times to solve problems that otherwise would have been ugly refactors to `if` statements. I’m not going back.

> I used to hate nested ternaries, but I also hate restructuring a nice line of code into `if-else` statements. The new rule adds an understandable, linear `if-else`, `if-else` expression to the language and is much nicer than multiple ternaries as nested branches.

So we felt we had a winning formula, but we knew it could be a jarring introduction to the community.

As a result, we decided to put this new formatting behind a temporary `--experimental-ternaries` option for a few months, and in the meantime go ahead and ship what the community has been clamoring for: [indented ternaries](https://github.com/prettier/prettier/pull/9559).

## Styling Overview

So what does this new style look like, anyway?

Here's a quick, contrived example to show the thinking behind "curious" ternaries:

<!-- prettier-ignore -->
```ts
const animalName =
  pet.canBark() ?
    pet.isScary() ?
      'wolf'
    : 'dog'
  : pet.canMeow() ? 'cat'
  : 'probably a bunny';
```

1. Every line that ends with a question mark is an **"if"**.
   - If you see `foo ?` it's like asking a question about foo – "if foo? then, …".
2. Every line that starts with a `:` is an **"else"**.
   - If you see `: foo` that means, "else, foo".
   - If you see `: foo ?` that means "else, if foo?".
3. Every line without `:` or `?` is a **"then"**.
   - If you just see `foo`, that means, "then foo".

And here's the code rewritten to demonstrate "case-style" ternaries:

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
