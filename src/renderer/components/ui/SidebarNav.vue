<template>
  <nav class="space-y-1 px-3">
    <router-link
      v-for="item in items"
      :key="item.to"
      :to="item.to"
      :class="cn(
        'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
        'hover:bg-accent hover:text-accent-foreground',
        $route.path === item.to ? 'bg-accent text-accent-foreground' : 'text-muted-foreground'
      )"
    >
      <component v-if="item.icon" :is="item.icon" class="h-4 w-4" />
      <span>{{ item.label }}</span>
    </router-link>
  </nav>
</template>

<script>
import { cn } from '@/lib/utils'

export default {
  name: 'SidebarNav',
  props: {
    items: {
      type: Array,
      required: true
    }
  },
  methods: {
    cn
  }
}
</script>
