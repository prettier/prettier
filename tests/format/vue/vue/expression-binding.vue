<!-- #7396 -->
<template>
<MyComponent
:foo="`loooooooooooooooooooooooooooooooooooooooooooooooooooooooooooog ${foo} template literal value`"
:foo1="`${first} loooooooooooooooooooooooooooooooooooooooooooooooooooooooooooog ${template} ${literal}`
        +`${second} loooooooooooooooooooooooooooooooooooooooooooooooooooooooooooog ${template} ${literal}`"
:foo2="`loooooooooooooooooooooooooooooooooooooooooooooooooooooooooooog ${foo +               bar} template literal value`"
:string="'loooooooooooooooooooooooooooooooooooooooooooooooooooooooooooog literal string value'"
:add="'first loooooooooooooooooooooooooooooooooooooooooooooooooooooooooooog' + 'second loooooooooooooooooooooooooooooooooooooooooooooooooooooooooooog'"
:number="100000000000000000000000000000000000000000000000000000000000000000000000000"
:short-template="`1
2`"
/>
</template>
