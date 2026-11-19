<template>
  <button @click="customRange = null; timeMenuOpen = false">x</button>
  <button v-on:click="foo(); bar()">x</button>
  <button @click="if (foo) bar();">x</button>
  <button @click="foo++; [bar] = baz">x</button>
  <button @click="foo = 1;">x</button>
</template>
