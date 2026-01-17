<!-- vue filters are only allowed in v-bind and interpolation -->
<template>
  <div class="allowed">{{value | thisIsARealSuperLongFilterPipe("arg1", arg2) | anotherPipeLongJustForFun | pipeTheThird}}</div>
  <div class="allowed" v-bind:something='value | thisIsARealSuperLongFilterPipe("arg1", arg2) | anotherPipeLongJustForFun | pipeTheThird'></div>
  <div class="allowed" :class='value | thisIsARealSuperLongFilterPipe("arg1", arg2) | anotherPipeLongJustForFun | pipeTheThird'></div>
  <div class="not-allowed" v-if='value | thisIsARealSuperLongBitwiseOr("arg1", arg2) | anotherBitwiseOrLongJustForFun | bitwiseOrTheThird'></div>
</template>
