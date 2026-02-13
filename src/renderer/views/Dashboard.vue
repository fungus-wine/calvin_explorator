<script setup lang="ts">
import { ref } from 'vue'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { ArrowUp } from 'lucide-vue-next'

const commandInput = ref('')

function sendCommand() {
  if (!commandInput.value.trim()) return

  // TODO: Send command to remote host
  console.log('Sending command:', commandInput.value)

  // Clear input after sending
  commandInput.value = ''
}

function handleKeyDown(event: KeyboardEvent) {
  if (event.key === 'Enter') {
    if (event.shiftKey) {
      // Shift+Enter: allow default behavior (new line)
      return
    } else {
      // Enter alone: send message
      event.preventDefault()
      sendCommand()
    }
  }
}
</script>

<template>
  <div>
    <h2 class="text-3xl font-bold mb-6">Dashboard</h2>

    <div class="space-y-6">
      <!-- Video Display Area (4:3 aspect ratio) -->
      <div class="w-full aspect-[4/3] bg-black border rounded-lg flex items-center justify-center">
        <p class="text-muted-foreground text-sm">Video stream will display here</p>
      </div>

      <!-- Command Input Area -->
      <div class="relative flex w-full items-center rounded-md border border-input shadow-sm transition-[color,box-shadow] has-[textarea:focus-visible]:border-primary has-[textarea:focus-visible]:ring-primary/50 has-[textarea:focus-visible]:ring-[3px]">
        <Textarea
          v-model="commandInput"
          placeholder="Enter command to send to remote host..."
          class="min-h-[120px] resize-none border-0 bg-transparent px-3 py-3 pr-12 shadow-none focus-visible:ring-0"
          @keydown="handleKeyDown"
        />
        <div class="absolute bottom-3 right-3">
          <button
            @click="sendCommand"
            class="flex items-center justify-center h-8 w-8 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-all disabled:pointer-events-none shadow-none outline-none focus-visible:ring-primary/50 focus-visible:ring-[3px]"
            :disabled="!commandInput.trim()"
            aria-label="Send command"
          >
            <ArrowUp class="h-4 w-4" :stroke-width="3" />
          </button>
        </div>
      </div>

      <p class="text-xs text-muted-foreground">
        Press Enter to send • Shift+Enter for new line
      </p>
    </div>
  </div>
</template>
