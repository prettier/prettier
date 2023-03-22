<template>
  <v-map @loaded="(map = $event) && initMap()"></v-map>
</template>
