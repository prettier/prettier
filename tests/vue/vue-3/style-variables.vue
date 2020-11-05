<style vars></style>
<style vars="     foo"></style>
<style vars="     {row   }"></style>
<style vars="{destructuring:{   a:{b}}}"></style>

<custom vars="     {row   }">Not A style</custom>
<script vars="     {row   }"></script>

<template>
<!-- Not root block -->
<style vars="     {row   }"></style>
</template> 

<style>
<vars>{not:{a:attribute}}</vars>
</style>