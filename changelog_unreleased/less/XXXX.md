#### Fix parsing of interpolation in at-rule params (#XXXX by @Manavarya09)

Less now deprecates bare variables in at-rule preludes (`@media @mq`) in favor of interpolation (`@media @{mq}`), which Prettier previously failed to parse.

<!-- prettier-ignore -->
```less
// Input
@media @{mq-xs} { .a { color: red } }

// Prettier stable
SyntaxError: CssSyntaxError: Unknown word mq-xs (1:10)

// Prettier main
@media @{mq-xs} {
  .a {
    color: red;
  }
}
```
