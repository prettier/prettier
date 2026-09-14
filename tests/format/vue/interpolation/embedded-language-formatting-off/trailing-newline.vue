<template>
  <div>
    {{
      (
        something.something.very.long.code ??
        fail("this is even longer to enforce multiple lines")
      ).toUpperCase()
    }}.
  </div>
  <div>({{ a
  }})</div>
  <div>{{ a
  }}</div>
</template>
