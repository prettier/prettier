<script lang="ts"></script>
<template>
  <comp>
    <template
    v-slot="x:    unknown   []"
    v-slot:named="   y  :     never"
    slot-scope=" { des: {truc: tured  } } : any "
    #shorthand=" abc   : string  "
    >
      {{ x[1] }}
    </template>
  </comp>
</template>
