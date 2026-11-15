<script setup lang="ts">
let selected: string | undefined;
</script>

<template>
  <button @click="selected = item.id as string; emit('select', selected)">Select</button>
</template>
