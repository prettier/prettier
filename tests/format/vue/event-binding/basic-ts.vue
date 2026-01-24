<script setup lang="ts">
let x = 1;
function log(...args) {
  console.log(...args);
}
</script>

<template>
  <div @click="if (x === 1 as number) { log('hello') } else { log('nonhello') };">{{ x }}</div>
</template>
