
<template>
  <p v-if="
            // leading comment
    isFolder(   /* NOTE: I like pizza */file)
    // trailing comment
    ">{{ /* leading comment */ (   file as /* NOTE: I like sushi */   mymodule.Folder   ).deadline /* trailing comment */    }}</p>
  <prettier :format="   /* leading comment */ myFunc( /* NOTE: I like banana */ o as unknown ) /* trailing comment */" />
</template>

<script lang="ts"></script>
