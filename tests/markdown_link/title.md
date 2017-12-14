[hello](#world "title")
[hello](#world 'title')
[hello](#world (title))

[a](https://example.com "\"")
[a](https://example.com '\"')
[a](https://example.com (\"))

[a](https://example.com "\'")
[a](https://example.com '\'')
[a](https://example.com (\'))

[a](https://example.com "\'")
[a](https://example.com '\)')
[a](https://example.com (\)))

<!-- mis-parsing, `\` are missing: -->

[a](https://example.com "\\\"")
[a](https://example.com '\\\'')
[a](https://example.com (\\\)))

[a](https://example.com "\\'")
[a](https://example.com '\\"')
[a](https://example.com (\\"))

