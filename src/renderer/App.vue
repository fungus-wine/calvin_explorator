<script lang="ts">
import 'vue-sonner/style.css'
import { defineComponent } from 'vue'
import Layout from './components/Layout.vue'
import ErrorBoundary from './components/ErrorBoundary.vue'
import { Toaster } from '@/components/ui/sonner'

export default defineComponent({
  name: 'App',
  components: {
    Layout,
    ErrorBoundary,
    Toaster
  }
})
</script>

<template>
  <div>
    <ErrorBoundary>
      <Layout />
    </ErrorBoundary>
    <Toaster position="top-center" />
  </div>
</template>
