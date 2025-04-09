<script lang="ts"></script>
<template>
<div
v-for="a:number       of x as number[]"
v-for="[ a  , b]   : [   string,string ]     of x as Array<     [string, string]>"
v-for="  a  of list.map( (x:any): unknown     => x.foo.bar)"
v-for="([longLongProp, longLongProp, [longLongProp, longLongProp='Hello, Prettier!', [longLongProp, longLongProp, anotherLongLongProp=[longLongProp, longLongProp, anotherLongLongProp, yetAnotherLongLongProp], yetAnotherLongLongProp], yetAnotherLongLongProp], yetAnotherLongLongProp], index) of longLongLongLongLongLongLongLongList"
>
</div>
</template>
