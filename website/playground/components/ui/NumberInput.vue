<script setup>
defineProps({
  label: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  min: {
    type: Number,
    default: undefined,
  },
  max: {
    type: Number,
    default: undefined,
  },
  step: {
    type: Number,
    default: 1,
  },
  value: {
    type: Number,
    default: undefined,
  },
});

defineEmits(["change"]);
</script>

<template>
  <label class="number-input__label" :title="title">
    {{ label }}
    <input
      class="number-input__input"
      type="number"
      :min="min"
      :max="max"
      :step="step"
      :value="value"
      @input="(event) => $emit('change', event.target.valueAsNumber)"
    />
  </label>
</template>

<style scoped>
.number-input__label {
  display: inline;
  font-size: 13px;
  line-height: 1.5rem;
  color: var(--color-gray-700);
}

.number-input__input {
  display: inline-block;
  box-sizing: border-box;
  vertical-align: middle;
  width: auto;
  max-width: 5rem;
  height: 1.875rem;
  margin-left: 0.75rem;
  padding: 0 0.625rem;
  outline: none;
  border: 1px solid var(--color-gray-200);
  border-radius: 0.25rem;
  background-color: var(--color-background);
  font-size: 13px;
  line-height: 1.5rem;
  color: var(--color-gray-900);
}

.number-input__input:hover {
  border-color: var(--color-gray-300);
}

.number-input__input:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

.number-input__input:disabled {
  color: var(--color-gray-500);
  cursor: not-allowed;
  opacity: 0.6;
}
</style>
