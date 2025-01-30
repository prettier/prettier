---
authors: "vjeux"
title: "$20k Bounty was Claimed!"
---

Prettier, a JavaScript code formatter, has seen an incredible adoption thanks to its careful handling of the very, very, long tail of ways people can write code. At this point, the formatting logic has been solid and after our work on [ternaries](https://prettier.io/blog/2023/11/13/curious-ternaries) lands, it will be in a happy state.

This means that we can now focus on the next important aspect: Performance. Prettier has never been fast per se, but fast enough for most use cases. This has always felt unsatisfying so we wanted to do something about it. What better way than a friendly competition.

On November 9th, we put up a [$10k bounty](https://twitter.com/Vjeux/status/1722733472522142022) for any project written in Rust that would pass 95% of Prettier test suite. Guillermo Rauch, CEO of Vercel, matched it to bring it to $20k and [napi.rs](https://napi.rs) added another $2.5k. The folks at Algora even made an amazing landing page for it.

[![](https://console.algora.io/prettier/og.png)](https://console.algora.io/challenges/prettier)

<!-- truncate -->

## Winner Winner Chicken Dinner

**I'm so excited to report that the [Biome project](https://biomejs.dev/) claimed the bounty!** It has been so epic to see a dozen people come together to improve compatibility in only a short 3 weeks. You can read their [full report](https://biomejs.dev/blog/biome-wins-prettier-challenge) for the details.

One question you are probably wondering is why would the Prettier team fund another project!? In practice, Prettier has been the dominant code formatter for JavaScript and as a result of a lack of competition, there has been little incentive to push on performance and fix various edge cases.

There is now a Prettier-compatible and way faster implementation in Biome that people can switch to. So Prettier has to step up its game! Thankfully Fabio Spampinato got nerd sniped with the challenge and found many extreme inefficiencies in Prettier's CLI by doing proper profiling. He will fix them by the end of the year.

By matching all the tests, the Biome project also found a lot of [bugs and questionable decisions](https://github.com/biomejs/biome/issues/739) in Prettier that we will be able to improve upon.

## Money, Money, Money

I want to start by acknowledging that this bounty and the continued success of Prettier have been possible thanks to various people making significant donations. Companies: Indeed ($20,000), Frontend Masters ($10,850), Sentry ($10,529), Salesforce ($10,025), Airbnb ($8,426), Cybozu ($6,086). Individuals: Shintaro Kaneko ($1,635), Suhail Doshi ($1,000), icchiman ($500), Mariusz Nowak ($270), Benoît Burgener ($270), Jeremy Combs ($270), f_subal ($230).

You may not be aware but thanks to all those donations, we've been able to [pay two people $1.5k/month](https://prettier.io/blog/2022/01/06/prettier-begins-paying-maintainers) for the past two years to keep shipping. Fisker Cheung and Sosuke Suzuki have done an incredible job!

With the current budget, we only have 8 months of runway left, so this is a good time to solicit your donations.

**Consider donating if you or your company are using Prettier and it has been helpful to you: [https://opencollective.com/prettier](https://opencollective.com/prettier)**

I would also like to give a big shout-out to [Open Collective](https://opencollective.com/prettier). It has been incredible for the project. From a maintainer perspective, it has been amazing as you can sign up without giving any personal information and it acts as a bank. It lets people give and receive money all around the world and handles all the tax documents properly which is a huge deal.

Prettier raised a total of $110k and redistributed $75k.

## Conclusion

While this was a one time bounty, the goal is to give an energy boost to the space of code formatting so that as an ecosystem we can make the best developer experience possible! It's been heartwarming to see so many people coming together and we hope they'll only achieve bigger things from now.
