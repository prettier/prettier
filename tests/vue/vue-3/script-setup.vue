<script setup></script>
<s setup="     foo"></script>
<s setup="     {row   }"></s>
<s setup="{destructuring:{   a:{b}}}"></s>

<custom setup="     {row   }">Not A script</custom>
<style setup="     {row   }"></style>

<template>
<!-- Not root block -->
<script setup="     {row   }"></script>
</template>

<script>
<setup>{not:{a:attribute}}</vars>
</script>
