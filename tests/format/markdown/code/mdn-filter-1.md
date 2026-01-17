
```css

img {
  filter: drop-shadow(2px 2px 0 hsl(300deg 100% 50%)) drop-shadow(
      -2px -2px 0 hsl(210deg 100% 50%) ) drop-shadow(2px 2px 0 hsl(120deg 100% 50%)) drop-shadow(
      -2px -2px 0 hsl(30deg 100% 50%)
    );
}
img + img {
filter: none;
}
```
