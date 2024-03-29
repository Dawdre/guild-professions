import { ref } from 'vue'
import { type EventProgress, type EventData } from '@/types/event'
import { useRouter } from 'vue-router'
import { type RouteLocationRaw } from 'vue-router'

const ENDPOINT_EVENT_URL = "https://ashypls-001-site1.ftempurl.com/endpoints/guildprofs/loader";

type OptionalFetch = () => Promise<void> | undefined;

export function useEventSource(options?: { fetch: OptionalFetch }) {
  if (!options) {
    options = { fetch: () => undefined };
  }

  const { fetch } = options;

  const router = useRouter()
  const eventSource = ref<EventSource | null>(null)
  const eventProgress = ref<EventProgress>({
    characterEventData: {
      parse_number: 0,
      parse_total: 0,
      message: ''
    },
    parseEventData: {
      parse_number: 0,
      parse_total: 0,
      message: ''
    },
    foundCheck: {
      found: true,
      message: ''
    },
    cacheCheck: "",
    statusText: '',
    progressText: "Fetching your guild's recipes",
    isLoading: false
  })

  const close = () => {
    if (eventSource.value) {
      eventSource.value.close()
      eventSource.value = null
    }
  }

  function startStream(urlParams: URLSearchParams) {
    eventSource.value = new EventSource(`${ENDPOINT_EVENT_URL}?${urlParams.toString()}`); 

    if (eventSource.value) {
      eventSource.value.addEventListener('cacheCheck', async (event) => {
        if (event.data) {
          eventProgress.value.cacheCheck = event.data
          close()
  
          try {
            eventProgress.value.isLoading = true
            await fetch()
          } finally {
            eventProgress.value.isLoading = false
          }
        } else {
          eventProgress.value.isLoading = true
        }
      })
  
      eventSource.value.addEventListener('statusCheck', (event) => (eventProgress.value.statusText = event.data))
  
      eventSource.value.addEventListener('progressCheck', (event) => {
        const eventData: EventData = JSON.parse(event.data)
  
        eventProgress.value.parseEventData = eventData
        eventProgress.value.progressText = `${eventData.parse_number}/${eventData.parse_total} recipes`
      })
  
      eventSource.value.addEventListener('characterCheck', (event) => {
        const eventData: EventData = JSON.parse(event.data)
  
        eventProgress.value.characterEventData = eventData
        eventProgress.value.progressText = `${eventData.parse_number}/${eventData.parse_total} characters`
      })
  
      eventSource.value.addEventListener('parseComplete', async () => {
        await fetch()
  
        eventProgress.value.isLoading = false
        eventProgress.value.progressText = ''
  
        close()
      })
    }
  }

  function foundCheckHandler(routeTo: RouteLocationRaw) {
    if (eventSource.value) {
      eventSource.value.addEventListener("foundCheck", (event) => {
        const eventData = JSON.parse(event.data)

        eventProgress.value.foundCheck = eventData

        if (eventProgress.value.foundCheck.found) {
          close()
          router.push(routeTo)
        } else {
          close()
        }
      })
    }
  }

  
  

  return {
    eventSource,
    eventProgress,

    startStream,
    foundCheckHandler,
    closeEventSource: close,
  } 
}