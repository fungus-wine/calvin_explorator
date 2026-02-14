<script lang="ts">
import { defineComponent } from 'vue'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { ArrowUp } from 'lucide-vue-next'

export default defineComponent({
  name: 'Dashboard',
  components: {
    Button,
    Textarea,
    ArrowUp
  },
  data() {
    return {
      commandInput: ''
    }
  },
  methods: {
    sendCommand(): void {
      if (!this.commandInput.trim()) return

      // TODO: Implement command sending to remote host
      // This will be replaced with actual IPC call to Electron main process
      // Example: window.electronAPI.sendCommand(this.commandInput)

      // Clear input after sending
      this.commandInput = ''
    },
    handleKeyDown(event: KeyboardEvent): void {
      if (event.key === 'Enter') {
        if (event.shiftKey) {
          // Shift+Enter: allow default behavior (new line)
          return
        } else {
          // Enter alone: send message
          event.preventDefault()
          this.sendCommand()
        }
      }
    },
    throwTestError(): void {
      throw new Error('Test error from Dashboard')
    }
  }
})
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-3xl font-bold">Dashboard</h2>
      <Button @click="throwTestError">Test Error</Button>
    </div>

    <div class="space-y-6">
      <!-- Video Display Area (4:3 aspect ratio) -->
      <div class="w-full max-w-5xl mx-auto aspect-[4/3] bg-black border rounded-lg flex items-center justify-center">
        <p class="text-muted-foreground text-sm">Video stream will display here</p>
      </div>

      <!-- Command Input Area -->
      <div class="relative flex w-full max-w-5xl mx-auto items-center rounded-md border border-input shadow-sm transition-[color,box-shadow] has-[textarea:focus-visible]:border-primary has-[textarea:focus-visible]:ring-primary/50 has-[textarea:focus-visible]:ring-[3px]">
        <Textarea
          v-model="commandInput"
          placeholder="Enter command to send to remote host..."
          class="min-h-[120px] resize-none border-0 bg-transparent px-3 py-3 pr-12 shadow-none focus-visible:ring-0"
          @keydown="handleKeyDown"
        />
        <div class="absolute bottom-3 right-3">
          <Button
            size="icon"
            @click="sendCommand"
            :disabled="!commandInput.trim()"
            aria-label="Send command"
            class="h-8 w-8"
          >
            <ArrowUp class="h-4 w-4" :stroke-width="3" />
          </Button>
        </div>
      </div>

    </div>
  </div>
</template>
