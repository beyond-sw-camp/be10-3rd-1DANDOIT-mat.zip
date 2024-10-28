<script setup>
const props = defineProps({
  modelValue: String,
  label: String,
  id: String,
  type: {
    type: String,
    default: 'text',
  },
  placeholder: {
    type: String,
    default: '',
  },
  inputStyle: {
    type: Object,
    default: () => ({}),
  },
showLabel: {
  type: Boolean,
default: true, // 기본값을 true로 설정하여 기본적으로 라벨을 표시
}
});
</script>
<template>
  <div class="input-field">
    <label  v-if="showLabel" :for="id">{{ label }}</label>
    <input
        :type="type"
        :id="id"
        :placeholder="placeholder"
        :value="modelValue"
        @input="$emit('update:modelValue', $event.target.value)"
        class="form-control"
        :style="inputStyle"
    />
  </div>
</template>

<style scoped>
 input::placeholder {
  color: #ccc; /* 원하는 색상으로 변경 */
}

 .left-aligned-label  {
   text-align: left;
 }
</style>