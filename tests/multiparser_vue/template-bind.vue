<template>
    <div v-bind:id=" 'list-'   +  id "></div>
    <div v-bind:id="  rawId | formatId "></div>
    <div v-bind:id=" ok ? 'YES' : 'NO' "></div>
</template>

