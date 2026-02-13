<template>
  <select
    :value="modelValue"
    @change="$emit('update:modelValue', $event.target.value)"
    :class="cn(
      'w-full px-3 py-2 border border-input bg-background rounded-md text-sm',
      'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
      'disabled:cursor-not-allowed disabled:opacity-50',
      className
    )"
    v-bind="$attrs"
  >
    <slot />
  </select>
</template>

<script>
import { cn } from '@/lib/utils'

export default {
  name: 'Select',
  inheritAttrs: false,
  props: {
    modelValue: {
      type: [String, Number],
      default: ''
    },
    className: {
      type: String,
      default: ''
    }
  },
  emits: ['update:modelValue'],
  methods: {
    cn
  }
}
</script>
