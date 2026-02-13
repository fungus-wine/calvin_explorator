<template>
  <div>
    <h2 class="text-3xl font-bold mb-6">Settings</h2>

    <div class="max-w-2xl">
      <div class="border rounded-lg p-6 mb-4">
        <h3 class="text-lg font-semibold mb-4">General Settings</h3>

        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium mb-2">Setting 1</label>
            <input
              type="text"
              class="w-full px-3 py-2 border rounded-md"
              placeholder="Enter value"
            />
          </div>

          <div>
            <label class="block text-sm font-medium mb-2">Setting 2</label>
            <input
              type="text"
              class="w-full px-3 py-2 border rounded-md"
              placeholder="Enter value"
            />
          </div>
        </div>
      </div>

      <button class="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90">
        Save Settings
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Settings',
  data() {
    return {
      // Add your settings data here
    }
  },
  methods: {
    // Add your methods here
  }
}
</script>
