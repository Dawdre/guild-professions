<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { NH1, NH2, NCard, NButton, NSkeleton } from 'naive-ui'

import {
  getGuildRecipes,
  getGuildRecipesUnique,
  getGuildCrafters,
  getGuildInfo,
  getRecipeDetails,
  type Recipe,
  type UniqueRecipe,
  type GuildCrafters,
  type GuildInfo
} from '@/api/api'
import { useEventSource } from '@/composable/useEventSource'
import { useStringUtils } from '@/composable/useString'
import { useAsyncState } from '@vueuse/core'
import GPRecipe from '@/components/GPRecipe.vue'
import GPProgressBar from '@/components/GPProgressBar.vue'
import GPProfessionPicker from '@/components/GPProfessionPicker.vue'
import GPRecipePicker from '@components/GPRecipePicker.vue'

const { sentenceCase } = useStringUtils()

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

const baseProfessions = computed(() => {
  const profs = allRecipes.value?.map((recipe) => recipe.prof_name)
  return Array.from(new Set(profs)).sort()
})

const { state, execute } = useAsyncState(
  getRecipeDetails,
  {
    id: 0,
    name: 'string',
    iconURL: '',
    reagents: []
  },
  { immediate: false }
)

async function pickRecipe(value: string) {
  filteredRecipes.value = allRecipes.value
    ?.filter((recipe) => recipe.recip_name === value)
    .sort((a, b) => {
      return a.char_guild_rank - b.char_guild_rank
    })

  const id = filteredRecipes.value?.find((recipe) => recipe.recip_name === value)?.recip_id

  if (id) {
    execute(0, id)
  }
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

const { startStream, eventProgress, closeEventSource } = useEventSource({ fetch })

const searchParams = new URLSearchParams({ guildname: guildName, realm })
startStream(searchParams)
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
    <router-link :to="{ name: 'home' }" @click="closeEventSource">
      <n-button quaternary type="default" class="gp-back-link">
        <span class="gp-back-link__arrow">▲</span> Select another Guild
      </n-button>
    </router-link>
    <n-card class="gp-card" size="small">
      <div class="gp-guild-info" v-if="guildInfo">
        <img
          v-if="guildInfo.factionIcon"
          :src="guildInfo.factionIcon"
          alt="faction"
          class="gp-faction__icon"
        />
        <div class="gp-guild-info__header">
          <n-h2 class="gp-guild-info__title">
            <span
              :class="[
                'gp-faction',
                guildInfo.faction === 'Alliance' ? 'gp-faction--alliance' : 'gp-faction--horde'
              ]"
            >
              {{ sentenceCase(guildInfo.name).value }}
            </span>
            ({{ sentenceCase(realm.replace('-', ' ')).value }}) -
            {{ guildInfo.memberCount }} crafters
          </n-h2>
        </div>
      </div>

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

    <n-card v-if="activeProfession" class="gp-card" size="small">
      <g-p-recipe-picker
        v-model="selectedValue"
        :unique-recipes="uniqueRecipes"
        :active-profession="activeProfession"
        @pick-recipe="pickRecipe"
      />
    </n-card>

    <template v-if="selectedValue">
      <g-p-recipe
        v-for="recipe in filteredRecipes"
        :key="recipe.recip_id"
        :filtered-recipe="recipe"
        :guild-crafters="guildCrafters!"
        :recipe-details="state"
      />
    </template>
  </main>
</template>

<style lang="scss" scoped>
.gp-guild-info {
  display: flex;
  flex-flow: wrap;
  align-items: center;
  margin-bottom: 0.5rem;

  @media screen and (min-width: 720px) {
    margin-bottom: 1rem;
  }

  &__header {
    display: flex;
    align-items: baseline;
    gap: 0.2rem;

    @media screen and (min-width: 720px) {
      flex-flow: column;
    }
  }

  &__title,
  &__subtitle {
    margin: 0;
    font-size: 1rem;

    @media screen and (min-width: 720px) {
      font-size: revert;
    }
  }
}

.gp-back-link {
  margin-bottom: 0.5rem;
  padding: 0 0.5rem;

  &__arrow {
    transform: rotate(-90deg);
    margin-right: 0.2rem;
  }
}
.gp-card {
  margin-bottom: 1rem;

  @media screen and (min-width: 720px) {
    width: 75vw;
  }
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

  @media screen and (min-width: 720px) {
    font-size: 1.7rem;
  }

  &-upper {
    font-size: 1.7rem;

    @media screen and (min-width: 720px) {
      font-size: 2rem;
    }
  }
}

.gp-faction {
  &__icon {
    height: 2.7rem;
    margin: 0 0.5rem 0.5rem 0;
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
