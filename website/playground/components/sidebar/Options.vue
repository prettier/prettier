<script setup>
import Checkbox from "../ui/Checkbox.vue";
import NumberInput from "../ui/NumberInput.vue";
import Select from "../ui/Select.vue";

const props = defineProps({
  option: { type: Object, required: true },
  value: { type: [Boolean, String, Number], default: undefined },
});

const emit = defineEmits(["change"]);

function getDescription(option) {
  const description = option.inverted
    ? option.oppositeDescription
    : option.description;
  return description && description.replaceAll("\n", " ");
}

function maybeInvert(value) {
  return props.option.inverted ? !value : value;
}

function handleChange(value) {
  emit("change", props.option, value);
}
</script>

<template>
  <Checkbox
    v-if="option.type === 'boolean'"
    :label="option.cliName"
    :title="getDescription(option)"
    :checked="maybeInvert(value)"
    @change="(checked) => handleChange(maybeInvert(checked))"
  />
  <Select
    v-else-if="option.type === 'choice'"
    :label="option.cliName"
    :title="getDescription(option)"
    :values="option.choices.map((choice) => choice.value)"
    :selected="value"
    @change="handleChange"
  />
  <NumberInput
    v-else-if="option.type === 'int'"
    :label="option.cliName"
    :title="getDescription(option)"
    :min="option.range.start"
    :max="option.range.end"
    :step="option.range.step"
    :value="value != null ? Number(value) : undefined"
    @change="handleChange"
  />
</template>
