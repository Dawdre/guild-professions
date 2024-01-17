<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { NSelect, NH1, NH2, NCard, NButton, NSkeleton } from 'naive-ui'

import {
  getGuildRecipes,
  getGuildRecipesUnique,
  getGuildCrafters,
  getGuildInfo,
  type Recipe,
  type UniqueRecipe,
  type GuildCrafters,
  type GuildInfo
} from '@/api/api'
import { useEventSource } from '@/composable/useEventSource'
import { useStringUtils } from '@/composable/useString'
import GPRecipe from '@/components/GPRecipe.vue'
import GPProgressBar from '@/components/GPProgressBar.vue'
import GPProfessionPicker from '@/components/GPProfessionPicker.vue'

const { capitaliseFirstLetter, sentenceCase } = useStringUtils()

const route = useRoute()
const guildName = Array.isArray(route.params.guild) ? route.params.guild[0] : route.params.guild
const realm = Array.isArray(route.params.realm) ? route.params.realm[0] : route.params.realm

const uniqueRecipes = ref<Array<UniqueRecipe>>()
const allRecipes = ref<Array<Recipe>>()
const guildCrafters = ref<GuildCrafters>()
const guildInfo = ref<GuildInfo>()
guildInfo.value = await getGuildInfo(realm, guildName)

const selectedValue = ref<string | undefined>(undefined)
const activeProfession = ref('')
const filteredRecipes = ref<Array<Recipe>>()

const recipeOptions = computed(() => {
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

function pickRecipe(value: string) {
  filteredRecipes.value = allRecipes.value?.filter((recipe) => recipe.recip_name === value)
}

async function fetch() {
  const [uniqueRecipesResult, recipesResult, craftersResult] = await Promise.allSettled([
    getGuildRecipesUnique(realm, guildName),
    getGuildRecipes(realm, guildName),
    getGuildCrafters(realm, guildName)
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

const {
  startStream,
  eventProgress,

  cacheCheckHandler,
  statusCheckHandler,
  progressCheckHandler,
  characterCheckHandler,
  parseCompleteHandler
} = useEventSource({ fetch })

const searchParams = new URLSearchParams({ guildname: guildName, realm })
startStream(searchParams)

cacheCheckHandler()
statusCheckHandler()
progressCheckHandler()
characterCheckHandler()
parseCompleteHandler()
</script>

<template>
  <header class="gp-header">
    <n-h1 class="gp-title">
      <router-link :to="{ name: 'home' }">
        <span class="gp-title-upper">G</span>UILD <span class="gp-title-upper">P</span>ROFESSIONS
      </router-link>
    </n-h1>
  </header>
  <main class="gp-content">
    <router-link :to="{ name: 'home' }">
      <n-button quaternary type="default" class="gp-back-link">
        <span style="transform: rotate(-90deg); margin-right: 0.2rem">▲</span> Select another Guild
      </n-button>
    </router-link>
    <n-card class="gp-card">
      <n-h2 v-if="guildInfo" class="gp-guild-info">
        <img :src="guildInfo.factionIcon" alt="faction" class="gp-faction__icon" />
        <div
          :class="[
            'gp-faction',
            guildInfo.faction === 'Alliance' ? 'gp-faction--alliance' : 'gp-faction--horde'
          ]"
        >
          {{ sentenceCase(guildInfo.name).value }}
        </div>
        ({{ sentenceCase(realm.replace('-', ' ')).value }}) - {{ guildInfo.memberCount }} crafters
      </n-h2>

      <div v-if="eventProgress.isLoading && eventProgress.cacheCheck !== ''" class="gp-skeleton">
        <n-skeleton text style="width: 20%; margin-bottom: 1rem" />
        <div class="gp-skeleton__actions">
          <n-skeleton v-for="n in 13" :key="n" :sharp="false" :height="56" :width="56" />
        </div>
      </div>

      <template v-else>
        <g-p-profession-picker
          v-if="baseProfessions.length > 0"
          v-model:active-profession="activeProfession"
          :base-professions="baseProfessions"
        />
      </template>
      <g-p-progress-bar
        v-if="eventProgress.isLoading && eventProgress.cacheCheck === ''"
        :event-progress="eventProgress"
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
          :options="recipeOptions"
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
.gp-guild-info {
  display: flex;
  flex-flow: wrap;
  gap: 0.5rem;
}
.gp-back-link {
  font-size: 1.2rem;
  margin-bottom: 1rem;
}
.gp-card {
  margin-bottom: 1rem;
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
  font-size: 1.2rem;

  a {
    text-decoration: none;
    color: var(--n-text-color);
  }

  @media screen and (min-width: 640px) {
    font-size: 1.7rem;
  }

  &-upper {
    font-size: 1.7rem;

    @media screen and (min-width: 640px) {
      font-size: 2rem;
    }
  }
}

.gp-faction {
  &__icon {
    height: 1.7rem;
  }

  &--alliance {
    color: #0070dd;
  }

  &--horde {
    color: #c41f3b;
  }
}

.gp-skeleton {
  &__actions {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
  }
}
</style>
