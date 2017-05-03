Add this to your init:

```elisp
(require 'prettier-js)
(prettier-mode)
```

If you don't use `js-mode`, which is what Prettier targets by default, you'll need to first set your major-mode of choice:

```elisp
(require 'prettier-js)
(setq prettier-target-mode "js2-mode")
(prettier-mode)
```

To adjust the CLI args used for the prettier command, you can customize the `prettier-args` variable:

```elisp
(setq prettier-args '(
  "--trailing-comma" "all"
  "--bracket-spacing" "false"
))
```
