<script setup lang="ts">
const 我 = () => {}
const me = () => {}

type Foo = () => void
</script>

<template>
  <div @click="   我   " />
  <div @click="   me   " />
  <div @click="我   as Foo" />
  <div @click="me   as Foo" />
  <div @click="我   satisfies Foo" />
  <div @click="me   satisfies Foo" />
  <div @click="   (<number>我)" />
  <div @click="   (<number>me)" />
  <div @click="   我!" />
  <div @click="   me!" />
  <div @click="我<   string>" />
  <div @click="me<   string>" />
  <div @click="我!   as unknown   satisfies Foo" />
  <div @click="me!   as unknown   satisfies Foo" />
</template>
