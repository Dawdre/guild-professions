<script setup lang="ts">
import { computed } from 'vue'
import { type EventProgress } from '@/types/event'
import { NH3, NProgress } from 'naive-ui'

const props = defineProps<{ eventProgress: EventProgress }>()

const percentTotal = computed(() => {
  let char = 0
  let parse = 0

  if (props.eventProgress.characterEventData.parse_number) {
    char =
      Math.round(
        (props.eventProgress.characterEventData.parse_number /
          props.eventProgress.characterEventData.parse_total) *
          100
      ) / 2
  }

  if (props.eventProgress.parseEventData.parse_number) {
    parse =
      Math.round(
        (props.eventProgress.parseEventData.parse_number /
          props.eventProgress.parseEventData.parse_total) *
          100
      ) / 2
  }

  return char + parse
})
</script>

<template>
  <n-h3>{{ eventProgress.statusText }}</n-h3>
  <n-progress
    type="line"
    status="success"
    :percentage="percentTotal"
    :indicator-placement="'inside'"
    :height="24"
    processing
  >
    <span style="font-size: 1rem">{{ eventProgress.loadingText }}</span>
  </n-progress>
</template>
@/types/event
