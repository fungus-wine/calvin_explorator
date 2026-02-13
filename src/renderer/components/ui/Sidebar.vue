<template>
  <aside :class="cn('flex h-screen w-64 flex-col border-r bg-background', className)">
    <div class="flex h-14 items-center border-b px-4">
      <slot name="header">
        <h2 class="text-lg font-semibold">Calvin Console</h2>
      </slot>
    </div>

    <div class="flex-1 overflow-auto py-4">
      <slot />
    </div>

    <div v-if="$slots.footer" class="border-t p-4">
      <slot name="footer" />
    </div>
  </aside>
</template>

<script>
import { cn } from '@/lib/utils'

export default {
  name: 'Sidebar',
  props: {
    className: {
      type: String,
      default: ''
    }
  },
  methods: {
    cn
  }
}
</script>
