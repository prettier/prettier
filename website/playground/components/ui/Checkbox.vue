<script setup>
import CheckIcon from "../icons/CheckIcon.vue";

defineProps({
  label: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    default: "",
  },
  checked: {
    type: Boolean,
    default: false,
  },
});

defineEmits(["change"]);
</script>

<template>
  <label class="checkbox__label" :title="title">
    <span
      :class="[
        'checkbox__root',
        checked ? 'checkbox--checked' : 'checkbox--unchecked',
      ]"
    >
      <input
        type="checkbox"
        class="checkbox__input"
        :checked="checked"
        @change="(ev) => $emit('change', ev.target.checked)"
      />
      <span
        :class="[
          'checkbox__indicator',
          !checked ? 'checkbox__indicator--hidden' : '',
        ]"
      >
        <CheckIcon class="checkbox__icon" />
      </span>
    </span>
    {{ label }}
  </label>
</template>

<style scoped>
.checkbox__label {
  display: flex;
  align-items: center;
  flex-wrap: nowrap;
  gap: 0.625rem;
  font-size: 13px;
  line-height: 1.5rem;
  color: var(--color-gray-700);
  cursor: pointer;
}

.checkbox__root {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  width: 1.25rem;
  height: 1.25rem;
  margin: 0;
  padding: 0;
  outline: 0;
  border: none;
  border-radius: 0.25rem;
}

.checkbox--unchecked {
  border: 1px solid var(--color-gray-300);
  background-color: transparent;
}

.checkbox--checked {
  background-color: var(--color-primary);
}

.checkbox__input {
  position: absolute;
  width: 0;
  height: 0;
  margin: 0;
  padding: 0;
}

.checkbox__indicator {
  display: flex;
  color: var(--color-gray-50);
}

.checkbox__indicator--hidden {
  display: none;
}

.checkbox__icon {
  width: 0.75rem;
  height: 0.75rem;
}
</style>
