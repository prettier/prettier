Add this to your init:

```elisp
(require 'prettier-js)
(add-hook 'before-save-hook
  (lambda ()
    (if
      (member (car (last (split-string buffer-file-name "\\."))) '("jsx" "js"))
      (prettier)
      ())))
```
