<template>
  <TabsContent
    :value="value"
    :class="cn(
      'mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
      $attrs.class
    )"
  >
    <slot />
  </TabsContent>
</template>

<script>
import { TabsContent } from 'radix-vue'
import { cn } from '@/lib/utils'

export default {
  name: 'TabsContent',
  components: {
    TabsContent
  },
  inheritAttrs: false,
  props: {
    value: {
      type: String,
      required: true
    }
  },
  methods: {
    cn
  }
}
</script>
