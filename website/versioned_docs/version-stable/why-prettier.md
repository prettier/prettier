---
id: why-prettier
title: Why Prettier?
---

## Building and enforcing a style guide

By far the biggest reason for adopting Prettier is to stop all the on-going debates over styles. [It is generally accepted that having a common style guide is valuable for a project and team](https://www.smashingmagazine.com/2012/10/why-coding-style-matters/) but getting there is a very painful and unrewarding process. People get very emotional around particular ways of writing code and nobody likes spending time writing and receiving nits.

So why choose the “Prettier style guide” over any other random style guide? Because Prettier is the only “style guide” that is fully automatic. Even if Prettier does not format all code 100% the way you’d like, it’s worth the “sacrifice” given the unique benefits of Prettier, don’t you think?

- “We want to free mental threads and end discussions around style. While sometimes fruitful, these discussions are for the most part wasteful.”
- “Literally had an engineer go through a huge effort of cleaning up all of our code because we were debating ternary style for the longest time and were inconsistent about it. It was dumb, but it was a weird on-going “great debate” that wasted lots of little back and forth bits. It’s far easier for us all to agree now: just run Prettier, and go with that style.”
- “Getting tired telling people how to style their product code.”
- “Our top reason was to stop wasting our time debating style nits.”
- “Having a githook set up has reduced the amount of style issues in PRs that result in broken builds due to ESLint rules or things I have to nit-pick or clean up later.”
- “I don’t want anybody to nitpick any other person ever again.”
- “It reminds me of how Steve Jobs used to wear the same clothes every day because he has a million decisions to make and he didn’t want to be bothered to make trivial ones like picking out clothes. I think Prettier is like that.”

## Helping Newcomers

Prettier is usually introduced by people with experience in the current codebase and JavaScript but the people that disproportionally benefit from it are newcomers to the codebase. One may think that it’s only useful for people with very limited programming experience, but we've seen it quicken the ramp up time from experienced engineers joining the company, as they likely used a different coding style before, and developers coming from a different programming language.

- “My motivations for using Prettier are: appearing that I know how to write JavaScript well.”
- “I always put spaces in the wrong place, now I don’t have to worry about it anymore.”
- “When you're a beginner you're making a lot of mistakes caused by the syntax. Thanks to Prettier, you can reduce these mistakes and save a lot of time to focus on what really matters.”
- “As a teacher, I will also tell to my students to install Prettier to help them to learn the JS syntax and have readable files.”

## Writing code

What usually happens once people are using Prettier is that they realize that they actually spend a lot of time and mental energy formatting their code. With Prettier editor integration, you can just press that magic key binding and poof, the code is formatted. This is an eye opening experience if anything else.

- “I want to write code. Not spend cycles on formatting.”
- “It removed 5% that sucks in our daily life - aka formatting”
- “We're in 2017 and it’s still painful to break a call into multiple lines when you happen to add an argument that makes it go over the 80 columns limit :(“

## Easy to adopt

We've worked very hard to use the least controversial coding styles, went through many rounds of fixing all the edge cases and polished the getting started experience. When you're ready to push Prettier into your codebase, not only should it be painless for you to do it technically but the newly formatted codebase should not generate major controversy and be accepted painlessly by your co-workers.

- “It’s low overhead. We were able to throw Prettier at very different kinds of repos without much work.”
- “It’s been mostly bug free. Had there been major styling issues during the course of implementation we would have been wary about throwing this at our JS codebase. I’m happy to say that’s not the case.”
- “Everyone runs it as part of their pre commit scripts, a couple of us use the editor on save extensions as well.”
- “It’s fast, against one of our larger JS codebases we were able to run Prettier in under 13 seconds.”
- “The biggest benefit for Prettier for us was being able to format the entire code base at once.”

## Clean up an existing codebase

Since coming up with a coding style and enforcing it is a big undertaking, it often slips through the cracks and you are left working on inconsistent codebases. Running Prettier in this case is a quick win, the codebase is now uniform and easier to read without spending hardly any time.

- “Take a look at the code :) I just need to restore sanity.”
- “We inherited a ~2000 module ES6 code base, developed by 20 different developers over 18 months, in a global team. Felt like such a win without much research.”

## Ride the hype train

Purely technical aspects of the projects aren’t the only thing people look into when choosing to adopt Prettier. Who built and uses it and how quickly it spreads through the community has a non-trivial impact.

- “The amazing thing, for me, is: 1) Announced 2 months ago. 2) Already adopted by, it seems, every major JS project. 3) 7000 stars, 100,000 npm downloads/mo”
- “Was built by the same people as React & React Native.”
- “I like to be part of the hot new things.”
- “Because soon enough people are gonna ask for it.”
