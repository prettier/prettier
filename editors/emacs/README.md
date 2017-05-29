Add this to your init:

```elisp
(require 'prettier-js)
```

Then you can hook to your favorite javascript mode:
```elisp
(add-hook 'js2-mode-hook 'prettier-mode)
(add-hook 'web-mode-hook 'prettier-mode)
...
```

To adjust the CLI args used for the prettier command, you can customize the `prettier-args` variable:

```elisp
(setq prettier-js-args '(
  "--trailing-comma" "all"
  "--bracket-spacing" "false"
))
```
