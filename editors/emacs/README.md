Add this to your init:

```elisp
(require 'prettier-js)
(add-hook 'js-mode-hook
          (lambda ()
            (add-hook 'before-save-hook 'prettier-before-save)))
```

If you don't use `js-mode`, which is what Prettier targets by default, you'll need to first set your major-mode of choice:

```elisp
(require 'prettier-js)
(setq prettier-target-mode "js2-mode")
(add-hook 'js2-mode-hook
          (lambda ()
            (add-hook 'before-save-hook 'prettier-before-save)))
```
