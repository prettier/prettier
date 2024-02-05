

```css

p {
  width: 300px;
  border: 2px solid red;
        padding: env(safe-area-inset-top, 50px) env(safe-area-inset-right, 50px) env(
      safe-area-inset-bottom,
  50px
    ) env(SAFE-AREA-INSET-LEFT, 50px);
}
```
