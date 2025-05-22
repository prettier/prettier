<template>
  <p v-if="isFolder(file)">{{ (   file as   mymodule.Folder    ).deadline }}</p>
  <prettier :format=" myFunc(  o as unknown )" />
</template>

<script lang="ts"></script>
