<template>
  <p v-if="isFolder(file)">{{ (   file as   mymodule.Folder    ).deadline }}</p>
</template>

<script lang="ts"></script>
