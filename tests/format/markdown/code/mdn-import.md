

```css


@import url("gridy.css")    supports(       display: grid) screen and (max-width: 400px);
@import url("flexy.css") supports(not (display: grid    ) and           (display: flex)) screen and (max-width: 400px);
@import url(
"whatever.css") supports((selector(h2 > p)) and    (font-tech(color-COLRv1)));
```
