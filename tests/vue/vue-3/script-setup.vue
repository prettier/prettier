<script setup></script>
<script setup="     foo"></script>
<script setup="     {row   }"></script>
<script setup="{destructuring:{   a:{b}}}"></s>

<!-- Not script -->
<custom setup="     {row   }">Not A script</custom>
<style setup="     {row   }"></style>

<!-- Not attribute -->
<script>
<setup>{not:{a:attribute}}</setup>
</script>
