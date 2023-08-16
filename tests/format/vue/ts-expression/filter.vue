<script setup lang="ts"></script>

<!-- vue filters are only allowed in v-bind and interpolation -->
<template>
  <div>
    <div class="allowed">{{
      value | thisIsARealSuperLongFilterPipe("arg1", arg2 as unknown) | anotherPipeLongJustForFun | pipeTheThird
    }}</div>
    <div class="allowed" v-bind:something='
      value | thisIsARealSuperLongFilterPipe("arg1", arg2 as unknown) | anotherPipeLongJustForFun | pipeTheThird
    '></div>
    <div class="allowed" :class='
      value | thisIsARealSuperLongFilterPipe("arg1", arg2 as unknown) | anotherPipeLongJustForFun | pipeTheThird'
    ></div>
    <div class="not-allowed" v-if='
      value | thisIsARealSuperLongBitwiseOr("arg1", arg2 as unknown) | anotherBitwiseOrLongJustForFun | bitwiseOrTheThird
    '></div>
  </div>
</template>
