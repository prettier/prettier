Add this to your init:

```elisp
(require 'prettier-js)
(add-hook 'js-mode-hook
          (lambda ()
            (add-hook 'before-save-hook 'prettier-before-save)))
```
