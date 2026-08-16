# https://github.com/prettier/prettier/issues/19588

[test](/hello?foo&quot\;bar)

[test](/hello?foo&quot;bar)

[normal](/path/to/page?q=1&r=2)

[with title](/url "title")

[autolink](https://example.com)

[spaced](<url with spaces>)

[paren](/url(foo)bar)

[nested](/url(a(b)c)d)

![image](https://example.com/img.png)
