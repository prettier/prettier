// https://github.com/typescript-eslint/typescript-eslint/pull/4382
a as (typeof node.children)[number]
a as (typeof node.children)[]
a as ((typeof node.children)[number])[]