<template>
  <TabsRoot :default-value="defaultValue" :model-value="modelValue" @update:model-value="$emit('update:modelValue', $event)">
    <slot />
  </TabsRoot>
</template>

<script>
import { TabsRoot } from 'radix-vue'

export default {
  name: 'Tabs',
  components: {
    TabsRoot
  },
  props: {
    defaultValue: {
      type: String,
      default: ''
    },
    modelValue: {
      type: String,
      default: undefined
    }
  },
  emits: ['update:modelValue']
}
</script>
