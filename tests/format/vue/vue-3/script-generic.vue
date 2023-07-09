<script setup lang="ts" generic="T"></script>

<script setup lang="ts" generic="T extends Type1 & Type2 & (Type3 | Type4), U"></script>

<script setup lang="ts" generic="T extends Type1 & Type2 & (Type3 | Type4), U extends string | number | boolean"></script>

<script setup lang="ts" generic="T extends | 'loooooooooooooooooooooooooooooooooong' | 'looooooooooooooooooooooooooooooooooong', U extends LooooooooooooooooooooooooooooooooongType<AnotherLoooooooooooooooongType<NonNullable<Record<string, (Type1 & Type2 & (LoooooooooooooooooooooongType3 | LoooooooooooooooooooooongType4)) | null>[string]>>>, C" ></script>

<script setup lang="ts" generic="


                                        // comment 1:
T 
extends string &

'loooooooooooooooooooooooooooooooooooooooooooooooooooooooooong',
/**
       * comment 2
 */
        U extends number, // comment 3
        
        /** comment 4 */ C extends MyType


        "></script>

<template>
  <!-- should not format it here -->
  <scriptt setup lang="ts" generic="T extends Type1 & Type2 & (Type3 | Type4), U extends string | number | boolean"></scriptt>
</template>

