<script></script>
<script></script>
<script></script>
<script></script>
<script></script>
<script></script>
<script setup lang="ts">
let x:      string |         number = 1
</script>
<script></script>
<script></script>
<script></script>
<template>
  <span
  v-if=" (x    as string).length  >     0"
  v-for="a in [1,2,  3,4,5].map(   (x  :    number) => x *   x)"
  :foo="  (x    as number).toFixed(   2) "
  >
  {{ (x      as      number).toFixed(2) }}
  </span>
</template>
