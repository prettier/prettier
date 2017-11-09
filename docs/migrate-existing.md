---
id: migrate-existing
title: Migrate Existing Code Base
---

If you want to rewrite your commit history to give the illusion that all code for all time was written according the prettier standards try the below command.

### _Warning this will change you git history it is encouraged that you create a backup of your repo!_

```
git filter-branch --tree-filter '\
    prettier --no-config --single-quote --tab-width=4\
    --print-width=110 --write "**/**.js" || \
    echo “Error formatting, possibly invalid JS“' -- --all
```

[See this blog post for more information](https://medium.com/millennial-falcon-technology/reformatting-your-code-base-using-prettier-or-eslint-without-destroying-git-history-35052f3d853e).
