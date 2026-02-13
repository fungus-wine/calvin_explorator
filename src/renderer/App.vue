<template>
  <div class="min-h-screen bg-background">
    <nav class="border-b">
      <div class="container mx-auto px-4 py-3">
        <div class="flex items-center space-x-6">
          <h1 class="text-xl font-bold">Calvin Console</h1>
          <div class="flex space-x-4">
            <router-link
              to="/dashboard"
              class="px-3 py-2 rounded-md text-sm font-medium hover:bg-accent"
              active-class="bg-accent"
            >
              Dashboard
            </router-link>
            <router-link
              to="/settings"
              class="px-3 py-2 rounded-md text-sm font-medium hover:bg-accent"
              active-class="bg-accent"
            >
              Settings
            </router-link>
          </div>
        </div>
      </div>
    </nav>

    <main class="container mx-auto px-4 py-8">
      <router-view />
    </main>
  </div>
</template>

<script>
export default {
  name: 'App'
}
</script>
