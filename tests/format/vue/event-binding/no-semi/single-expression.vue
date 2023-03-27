<template>
  <foo-bar
    @click="[foo, bar].forEach(fn => void fn())"
    @loaded="(map = $event) && initMap()"
  ></foo-bar>
</template>
