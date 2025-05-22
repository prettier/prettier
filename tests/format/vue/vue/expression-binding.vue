<!-- #7396 -->
<template>
<MyComponent
:foo="`loooooooooooooooooooooooooooooooooooooooooooooooooooooooooooog ${foo} template literal value`"
:bar="`${first} loooooooooooooooooooooooooooooooooooooooooooooooooooooooooooog ${template} ${literal}`
+`${second} loooooooooooooooooooooooooooooooooooooooooooooooooooooooooooog ${template} ${literal}`"
:baz="`loooooooooooooooooooooooooooooooooooooooooooooooooooooooooooog ${foo +               bar} template literal value`"
:src="'loooooooooooooooooooooooooooooooooooooooooooooooooooooooooooog literal string value'"
:add="'first loooooooooooooooooooooooooooooooooooooooooooooooooooooooooooog' + 'second loooooooooooooooooooooooooooooooooooooooooooooooooooooooooooog'"
:num="100000000000000000000000000000000000000000000000000000000000000000000000000"
/>
</template>
