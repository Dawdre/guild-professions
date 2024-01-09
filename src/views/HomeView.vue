<script setup lang="ts">
import { computed, ref, unref } from 'vue'
import { useRouter } from 'vue-router'
import { NSelect, NH1, NH2, NAlert, NCard, type FormValidationError } from 'naive-ui'
import {
  startStream,
  getGuildRecipes,
  getGuildRecipesUnique,
  getGuildCrafters,
  type Recipe,
  type UniqueRecipe,
  type GuildCrafters
} from '@/api/api'
import { type EventProgress, type EventData } from '@/types/event'
import { useStringUtils } from '@/composable/useString'

import GPForm from '@/components/GPForm.vue'
import GPRecipe from '@/components/GPRecipe.vue'
import GPProgressBar from '@/components/GPProgressBar.vue'
import GPProfessionPicker from '@/components/GPProfessionPicker.vue'

const { capitaliseFirstLetter, sentenceCase } = useStringUtils()
const router = useRouter()

const uniqueRecipes = ref<Array<UniqueRecipe>>()
const allRecipes = ref<Array<Recipe>>()
const guildCrafters = ref<GuildCrafters>()
const filteredRecipes = ref<Array<Recipe>>()

const isLoading = ref(false)
const failEventError = ref('')

const formValue = ref({
  guildName: '',
  realm: ''
})

const selectedValue = ref<string | undefined>(undefined)
const activeProfession = ref('')
const eventProgress = ref<EventProgress>({
  statusText: '',
  parseEventData: {
    parse_number: 0,
    parse_total: 0,
    message: ''
  },
  characterEventData: {
    parse_number: 0,
    parse_total: 0,
    message: ''
  },
  loadingText: "Fetching your guild's recipes"
})
const guildInfo = ref({
  name: '',
  realm: '',
  faction: '',
  character_count: 0
})

const someOptions = computed(() => {
  return uniqueRecipes.value
    ?.map((recipe) => ({
      label: recipe.recip_name,
      value: recipe.recip_name,
      prof_name: recipe.prof_name
    }))
    .filter((option) => option.prof_name === activeProfession.value)
})

const baseProfessions = computed(() => {
  const profs = allRecipes.value?.map((recipe) => recipe.prof_name)
  return Array.from(new Set(profs)).sort()
})

const formatGuildName = computed(() => formValue.value.guildName.replace(/ /g, '-').toLowerCase())

function pickRecipe(value: string) {
  filteredRecipes.value = allRecipes.value?.filter((recipe) => recipe.recip_name === value)
}

async function fetchAll() {
  const [uniqueRecipesResult, recipesResult, craftersResult] = await Promise.allSettled([
    getGuildRecipesUnique(formValue.value.realm, formatGuildName.value),
    getGuildRecipes(formValue.value.realm, formatGuildName.value),
    getGuildCrafters(formValue.value.realm, formatGuildName.value)
  ])

  if (
    uniqueRecipesResult.status === 'rejected' ||
    recipesResult.status === 'rejected' ||
    craftersResult.status === 'rejected'
  ) {
    console.log('error')
    return
  }

  if (
    uniqueRecipesResult.status === 'fulfilled' &&
    recipesResult.status === 'fulfilled' &&
    craftersResult.status === 'fulfilled'
  ) {
    uniqueRecipes.value = uniqueRecipesResult.value
    allRecipes.value = recipesResult.value
    guildCrafters.value = craftersResult.value
  }
}

async function submitForm(errors: FormValidationError) {
  if (errors) {
    return
  } else {
    isLoading.value = true
    selectedValue.value = undefined

    guildInfo.value.name = unref(formValue.value.guildName)
    guildInfo.value.realm = formValue.value.realm

    const source = await startStream(formValue.value.realm, formatGuildName.value)

    source.addEventListener('fail', (event) => {
      failEventError.value = event.data
      isLoading.value = false
    })

    source.addEventListener('cacheCheck', async (event) => {
      if (event.data) {
        source.close()

        // router.push({
        //   name: 'about',
        //   params: { guild: formatGuildName.value, realm: formValue.value.realm }
        // })

        await fetchAll()

        failEventError.value = ''
        isLoading.value = false
      }
    })

    source.addEventListener('statusCheck', (event) => (eventProgress.value.statusText = event.data))

    source.addEventListener('progressCheck', (event) => {
      const eventData: EventData = JSON.parse(event.data)

      eventProgress.value.parseEventData = eventData
      eventProgress.value.loadingText = `${eventData.parse_number}/${eventData.parse_total} recipes`
    })

    source.addEventListener('characterCheck', (event) => {
      const eventData: EventData = JSON.parse(event.data)

      eventProgress.value.characterEventData = eventData
      eventProgress.value.loadingText = `${eventData.parse_number}/${eventData.parse_total} characters`

      guildInfo.value.character_count = eventProgress.value.characterEventData.parse_number
    })

    source.addEventListener('parseComplete', async () => {
      await fetchAll()

      failEventError.value = ''
      isLoading.value = false
      eventProgress.value.loadingText = ''

      source.close()
    })
  }
}
</script>

<template>
  <header class="gp-header">
    <n-h1 class="gp-title">
      <span class="gp-title-upper">G</span>UILD <span class="gp-title-upper">P</span>ROFESSIONS
    </n-h1>
  </header>
  <main class="gp-content">
    <n-alert v-if="failEventError" title="There is a problem" type="error" closable>
      {{ failEventError }}
    </n-alert>

    <n-card class="gp-card">
      <g-p-form v-model="formValue" @submit-form="submitForm" :is-disabled="isLoading" />
    </n-card>

    <n-card v-if="baseProfessions.length > 0 || isLoading" class="gp-card">
      <n-h2>
        {{ sentenceCase(guildInfo.name).value }} ({{
          capitaliseFirstLetter(guildInfo.realm).value
        }}) - {{ guildInfo.character_count }} crafters
      </n-h2>

      <g-p-progress-bar v-if="isLoading" :event-progress="eventProgress" />

      <g-p-profession-picker
        v-if="baseProfessions.length > 0"
        v-model:active-profession="activeProfession"
        :base-professions="baseProfessions"
      />
    </n-card>

    <n-card v-if="activeProfession" class="gp-card">
      <div class="gp-recipe-picker">
        <n-h2>
          <label for="recipe-select" class="gp-recipe-picker__label">
            Find a {{ capitaliseFirstLetter(activeProfession).value }} recipe
          </label>
        </n-h2>
        <n-select
          v-model:value="selectedValue"
          id="recipe-select"
          filterable
          clearable
          :options="someOptions"
          placeholder="Select or search for a recipe"
          size="large"
          @update:value="pickRecipe"
        />
      </div>
    </n-card>

    <template v-if="selectedValue">
      <g-p-recipe
        v-for="recipe in filteredRecipes"
        :key="recipe.recip_id"
        :filtered-recipe="recipe"
        :guild-crafters="guildCrafters!"
      />
    </template>
  </main>
</template>

<style lang="scss" scoped>
.n-alert {
  margin-bottom: 1rem;
  width: 75vw;
}

.gp-content {
  padding: 1rem;

  display: grid;
}

.gp-header {
  display: flex;
  align-items: end;
  background-color: #202020;
  border-bottom: 1px solid #444;

  &:before {
    content: ' ';
    background-image: url('/images/professions.webp');
    background-repeat: no-repeat;

    height: 83px;
    width: 180px;
    background-position-y: bottom;
  }
}

.gp-title {
  margin-bottom: 0;

  &-upper {
    font-size: 2.5rem;
  }
}

.gp-prof-picker {
  display: flex;
  flex-wrap: wrap;
  margin-bottom: 1rem;

  &__action {
    padding-right: 0.5rem;
    border: none;
    background: none;
    cursor: pointer;

    &--active {
      border: 3px solid red;
    }
  }

  &__img {
    border-radius: 5px;
    box-shadow:
      rgba(0, 0, 0, 0.4) 0px 2px 4px,
      rgba(0, 0, 0, 0.3) 0px 7px 13px -3px,
      rgba(0, 0, 0, 0.2) 0px -3px 0px inset;
  }
}

.gp-recipe-picker {
  margin-bottom: 1rem;
  width: 75vw;
}

.gp-card {
  margin-bottom: 1rem;
}
</style>
@/types/event
