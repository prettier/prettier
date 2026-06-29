<!--

The following takes from https://github.com/microsoft/vscode/blob/b949969d71c3788856872a52e3bc6441292046f9/.github/prompts/setup-environment.prompt.md?plain=1#L30-L43

According to commonmark `</example>` should be parsed as part of the list item

https://spec.commonmark.org/dingus/?text=%3Cexample%3E%0A%23%23%20Installation%20Summary%0A%0A%23%23%23%20%E2%9D%93%20Unable%20to%20Verify%0A-%20ToolName%20-%20%5BReason%20why%20it%20couldn%27t%20be%20verified%5D%0A%20%20-%20%5BManual%20verification%20instructions%20steps%5D%0A%3C%2Fexample%3E

But ... whatever

-->

<example>
## Installation Summary

### ❓ Unable to Verify
- ToolName - [Reason why it couldn't be verified]
  - [Manual verification instructions steps]
</example>

---

<!--
Added a blank line before `</example>`
-->

<example>
## Installation Summary

### ❓ Unable to Verify
- ToolName - [Reason why it couldn't be verified]
  - [Manual verification instructions steps]

</example>
