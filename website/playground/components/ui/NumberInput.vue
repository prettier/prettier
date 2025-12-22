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
    required: false,
  },
  max: {
    type: Number,
    required: false,
  },
  step: {
    type: Number,
    required: false,
  },
  value: {
    type: Number,
    required: true,
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
      @input="$emit('change', $event.target.valueAsNumber)"
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
  box-sizing: border-box;
  display: inline-block;
  vertical-align: middle;
  height: 1.875rem;
  padding: 0 0.625rem;
  margin-left: 0.75rem;
  outline: 0;
  border: 1px solid var(--color-gray-200);
  border-radius: 0.25rem;
  background-color: var(--color-background);
  font-size: 13px;
  line-height: 1.5rem;
  color: var(--color-gray-900);
  max-width: 5rem;
  width: auto;
}

.number-input__input:hover {
  border-color: var(--color-gray-300);
}

.number-input__input:focus {
  outline: 2px solid var(--color-primary);
  outline-offset: -1px;
  border-color: var(--color-primary);
}

.number-input__input:disabled {
  color: var(--color-gray-500);
  cursor: not-allowed;
  opacity: 0.6;
}
</style>
