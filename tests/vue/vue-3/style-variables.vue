<style vars></style>
<style vars="     foo"></style>
<style vars="     {row   }"></style>
<style vars="{destructuring:{   a:{b}}}"></style>

<!-- Not style -->
<custom vars="     {row   }">Not A style</custom>
<script vars="     {row   }"></script>

<!-- Not root block -->
<template>
<style vars="     {row   }"></style>
</template> 

<!-- Not attribute -->
<style>
<vars>{not:{a:attribute}}</vars>
</style>
