<template>
  <TabsList :class="cn('inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground', $attrs.class)">
    <slot />
  </TabsList>
</template>

<script>
import { TabsList } from 'radix-vue'
import { cn } from '@/lib/utils'

export default {
  name: 'TabsList',
  components: {
    TabsList
  },
  inheritAttrs: false,
  methods: {
    cn
  }
}
</script>
