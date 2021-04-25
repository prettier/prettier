<script setup></script>
<script setup="     foo"></script>
<script setup="     {row   }"></script>
<script setup="{destructuring:{   a:{b}}}"></script>

<!-- Not script -->
<custom setup="     {row   }">Not A script</custom>
<style setup="     {row   }"></style>

<!-- Not root block -->
<template>
<script setup="     {row   }"></script>
</template>

<!-- Not attribute -->
<script>
<setup>{not:{a:attribute}}</setup>
</script>
