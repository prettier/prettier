<script setup>
defineProps({
  title: {
    type: String,
    required: true,
  },
  label: {
    type: String,
    required: true,
  },
  values: {
    type: Array,
    required: true,
  },
  selected: {
    type: [String, Number],
    default: undefined,
  },
});

const emit = defineEmits(["change"]);

function handleChange(event) {
  emit("change", event.target.value);
}
</script>

<template>
  <label class="select__label" :title="title">
    <span class="select__label-text">{{ label }}</span>
    <div class="select__container">
      <select class="select__trigger" :value="selected" @change="handleChange">
        <option v-for="(value, index) in values" :key="index" :value="value">
          {{ value }}
        </option>
      </select>
    </div>
  </label>
</template>

<style scoped>
.select__label {
  display: inline;
  font-size: 13px;
  line-height: 1.5rem;
}

.select__label-text {
  display: inline;
}

.select__container {
  position: relative;
  display: inline-block;
  vertical-align: middle;
  margin-left: 0.75rem;
  max-width: 10rem;
}

.select__trigger {
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.625rem;
  height: 1.875rem;
  padding-left: 0.625rem;
  padding-right: 0.625rem;
  margin: 0;
  outline: 0;
  border: 1px solid var(--color-gray-200);
  border-radius: 0.25rem;
  background-color: var(--color-background);
  font-size: 13px;
  line-height: 1.5rem;
  color: var(--color-gray-900);
  user-select: none;
  width: 100%;
  cursor: pointer;
}

.select__trigger:hover {
  background-color: var(--color-gray-100);
}
</style>
