<script lang="ts"></script>

<template>
  <comp :foo="   (a:string)=>1"/>
  <comp :foo=" <X extends Something & AnothoerOne, Y    extends unknown[]>(x:X,y:Y)=>y.length + x.foobar.abcdefg"/>
  <comp :foo="(myFunction<T   |U>(qwerty,qwerty.qwerty?.qwerty)as any) + x.filter(abcdefg as never).join(xxx)"/>
</template>
