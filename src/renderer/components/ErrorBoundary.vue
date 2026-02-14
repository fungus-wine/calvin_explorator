<script lang="ts">
import { defineComponent } from 'vue'
import { toast } from 'vue-sonner'

export default defineComponent({
  name: 'ErrorBoundary',
  errorCaptured(err: Error, instance, info: string): boolean {
    // Show error toast
    toast.error(err.message || 'An unexpected error occurred')

    // Log error for debugging
    console.error('Error caught by ErrorBoundary:', err)
    console.error('Component:', instance)
    console.error('Error info:', info)

    // Prevent error from propagating
    return false
  }
})
</script>

<template>
  <slot />
</template>
