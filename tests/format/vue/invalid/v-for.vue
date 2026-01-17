<template>
  <div>
    <div
      v-for="    _       in          "
      v-for="            in _        "
      v-for="            in          "
      v-for="    _,      in a        "
      v-for="    ,_      in a        "

      v-for="    a, b,      in a        "
      v-for="    a,  , c     in a        "

      v-for="     , b, c     in a        "
      v-for="    a, b,       in a        "

      v-for="     , b, c     in a        "
      v-for="    a,  , c     in a        "
      v-for="    (,a,b) of 'abcd'        "
    ></div>
  </div>
</template>
