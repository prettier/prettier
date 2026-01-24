<script setup lang="ts"></script>

<template>
  <div @click=" (  x :   never) =>      null">arrow</div>
  <div @click=" function(  a    :   unknown[])      {
      console.log(    'abcdefg');
      return;
  }">anonymous function</div>
</template>
