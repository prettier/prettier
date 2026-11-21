<template>
  <button @click="firstName = ''; lastName = ''">Clear</button>
  <button @click="increment(); track('click')">Count</button>
  <button @click="if (valid) submit();">Submit</button>
  <button @click="if (valid) { submit(); } else { reset(); }">Submit or reset</button>
  <button @click="const id = getId(); select(id)">Select</button>
  <button @click="items.forEach((item) => { item.done = true }); save()">Done</button>
  <button @click="submit();">Single</button>
</template>
