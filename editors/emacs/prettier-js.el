;;; prettier-js.el --- utility functions to format reason code

;; Copyright (c) 2014 The go-mode Authors. All rights reserved.
;; Portions Copyright (c) 2015-present, Facebook, Inc. All rights reserved.

;; Redistribution and use in source and binary forms, with or without
;; modification, are permitted provided that the following conditions are
;; met:

;; * Redistributions of source code must retain the above copyright
;; notice, this list of conditions and the following disclaimer.
;; * Redistributions in binary form must reproduce the above
;; copyright notice, this list of conditions and the following disclaimer
;; in the documentation and/or other materials provided with the
;; distribution.
;; * Neither the name of the copyright holder nor the names of its
;; contributors may be used to endorse or promote products derived from
;; this software without specific prior written permission.

;; THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
;; "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
;; LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
;; A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
;; OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
;; SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
;; LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
;; DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
;; THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
;; (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
;; OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.)

;;; Commentary:
;;

;;; Code:

(defcustom prettier-command "prettier"
  "The 'prettier' command."
  :type 'string
  :group 'prettier)

(defcustom prettier-args '()
  "List of args to send to prettier command"
  :type 'list
  :group 'prettier)

(defcustom prettier-target-mode
  "js-mode"
  "Name of the major mode to be used by 'prettier-before-save'."
  :type 'string
  :group 'prettier)

(defcustom prettier-show-errors 'buffer
    "Where to display prettier error output.
It can either be displayed in its own buffer, in the echo area, or not at all.
Please note that Emacs outputs to the echo area when writing
files and will overwrite prettier's echo output if used from inside
a `before-save-hook'."
    :type '(choice
            (const :tag "Own buffer" buffer)
            (const :tag "Echo area" echo)
            (const :tag "None" nil))
      :group 'prettier)

(defcustom prettier-width-mode nil
  "Specify width when formatting buffer contents."
  :type '(choice
          (const :tag "Window width" window)
          (const :tag "Fill column" fill)
          (const :tag "None" nil))
  :group 'prettier)

;;;###autoload
(defun prettier-before-save ()
  "Add this to .emacs to run prettier on the current buffer when saving:
 (add-hook 'before-save-hook 'prettier-before-save)."
  (interactive)
  (when (string-equal (symbol-name major-mode) prettier-target-mode) (prettier)))

(defun prettier--goto-line (line)
  (goto-char (point-min))
    (forward-line (1- line)))

(defun prettier--delete-whole-line (&optional arg)
    "Delete the current line without putting it in the `kill-ring'.
Derived from function `kill-whole-line'.  ARG is defined as for that
function."
    (setq arg (or arg 1))
    (if (and (> arg 0)
             (eobp)
             (save-excursion (forward-visible-line 0) (eobp)))
        (signal 'end-of-buffer nil))
    (if (and (< arg 0)
             (bobp)
             (save-excursion (end-of-visible-line) (bobp)))
        (signal 'beginning-of-buffer nil))
    (cond ((zerop arg)
           (delete-region (progn (forward-visible-line 0) (point))
                          (progn (end-of-visible-line) (point))))
          ((< arg 0)
           (delete-region (progn (end-of-visible-line) (point))
                          (progn (forward-visible-line (1+ arg))
                                 (unless (bobp)
                                   (backward-char))
                                 (point))))
          (t
           (delete-region (progn (forward-visible-line 0) (point))
                                                  (progn (forward-visible-line arg) (point))))))

(defun prettier--apply-rcs-patch (patch-buffer)
  "Apply an RCS-formatted diff from PATCH-BUFFER to the current buffer."
  (let ((target-buffer (current-buffer))
        ;; Relative offset between buffer line numbers and line numbers
        ;; in patch.
        ;;
        ;; Line numbers in the patch are based on the source file, so
        ;; we have to keep an offset when making changes to the
        ;; buffer.
        ;;
        ;; Appending lines decrements the offset (possibly making it
        ;; negative), deleting lines increments it. This order
        ;; simplifies the forward-line invocations.
        (line-offset 0))
    (save-excursion
      (with-current-buffer patch-buffer
        (goto-char (point-min))
        (while (not (eobp))
          (unless (looking-at "^\\([ad]\\)\\([0-9]+\\) \\([0-9]+\\)")
            (error "invalid rcs patch or internal error in prettier--apply-rcs-patch"))
          (forward-line)
          (let ((action (match-string 1))
                (from (string-to-number (match-string 2)))
                (len  (string-to-number (match-string 3))))
            (cond
             ((equal action "a")
              (let ((start (point)))
                (forward-line len)
                (let ((text (buffer-substring start (point))))
                  (with-current-buffer target-buffer
                    (setq line-offset (- line-offset len))
                    (goto-char (point-min))
                    (forward-line (- from len line-offset))
                    (insert text)))))
             ((equal action "d")
              (with-current-buffer target-buffer
                (prettier--goto-line (- from line-offset))
                (setq line-offset (+ line-offset len))
                (prettier--delete-whole-line len)))
             (t
              (error "invalid rcs patch or internal error in prettier--apply-rcs-patch")))))))))

(defun prettier--process-errors (filename tmpfile errorfile errbuf)
  (with-current-buffer errbuf
    (if (eq prettier-show-errors 'echo)
        (progn
          (message "%s" (buffer-string))
          (prettier--kill-error-buffer errbuf))
      (insert-file-contents errorfile nil nil nil)
      ;; Convert the prettier stderr to something understood by the compilation mode.
      (goto-char (point-min))
      (insert "prettier errors:\n")
      (while (search-forward-regexp (regexp-quote tmpfile) nil t)
        (replace-match (file-name-nondirectory filename)))
      (compilation-mode)
      (display-buffer errbuf))))

(defun prettier--kill-error-buffer (errbuf)
  (let ((win (get-buffer-window errbuf)))
    (if win
        (quit-window t win)
      (with-current-buffer errbuf
        (erase-buffer))
      (kill-buffer errbuf))))

(defun prettier ()
   "Format the current buffer according to the prettier tool."
   (interactive)
   (let* ((ext (file-name-extension buffer-file-name t))
          (bufferfile (make-temp-file "prettier" nil ext))
          (outputfile (make-temp-file "prettier" nil ext))
          (errorfile (make-temp-file "prettier" nil ext))
          (errbuf (if prettier-show-errors (get-buffer-create "*prettier errors*")))
          (patchbuf (get-buffer-create "*prettier patch*"))
          (coding-system-for-read 'utf-8)
          (coding-system-for-write 'utf-8)
          (width-args
           (cond
            ((equal prettier-width-mode 'window)
             (list "--print-width" (number-to-string (window-body-width))))
            ((equal prettier-width-mode 'fill)
             (list "--print-width" (number-to-string fill-column)))
            (t
             '()))))
     (unwind-protect
         (save-restriction
           (widen)
           (write-region nil nil bufferfile)
           (if errbuf
               (with-current-buffer errbuf
                 (setq buffer-read-only nil)
                 (erase-buffer)))
           (with-current-buffer patchbuf
             (erase-buffer))
           (if (zerop (apply 'call-process
                             prettier-command nil (list (list :file outputfile) errorfile)
                             nil (append (append prettier-args width-args) (list bufferfile))))
               (progn
                 (call-process-region (point-min) (point-max) "diff" nil patchbuf nil "-n" "-"
                                      outputfile)
                 (prettier--apply-rcs-patch patchbuf)
                 (message "Applied prettier with args `%s'" prettier-args)
                 (if errbuf (prettier--kill-error-buffer errbuf)))
             (message "Could not apply prettier")
             (if errbuf
                 (prettier--process-errors (buffer-file-name) bufferfile errorfile errbuf))
             )))
     (kill-buffer patchbuf)
     (delete-file errorfile)
     (delete-file bufferfile)
     (delete-file outputfile)))

(provide 'prettier-js)
