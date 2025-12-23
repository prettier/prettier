<script setup>
import { computed } from "vue";
import Collapsible from "../ui/Collapsible.vue";
import Option from "./Options.vue";

const props = defineProps({
  categories: {
    type: Array,
    required: true,
  },
  availableOptions: { type: Array, required: true },
  optionValues: { type: Object, required: true },
});

defineEmits(["option-value-change"]);

const options = groupBy(props.availableOptions, (option) => option.category);

const availableCategories = computed(() => {
  return props.categories.filter((category) => options[category]?.length > 0);
});

function groupBy(array, iteratee) {
  const result = Object.create(null);

  for (const value of array) {
    const key = iteratee(value);

    if (Array.isArray(result[key])) {
      result[key].push(value);
    } else {
      result[key] = [value];
    }
  }

  return result;
}
</script>

<template>
  <Collapsible
    v-for="category in availableCategories"
    :key="category"
    :title="category"
  >
    <Option
      v-for="option in options[category]"
      :key="option.name"
      :option="option"
      :value="optionValues[option.name]"
      @change="(option, value) => $emit('option-value-change', option, value)"
    />
  </Collapsible>
</template>
