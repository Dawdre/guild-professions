<script setup lang="ts">
import { computed, ref } from "vue";
import {
  NSelect,
  NH1,
  NH2,
  NSpin,
  NAlert,
  type FormValidationError,
} from "naive-ui";
import {
  startStream,
  getGuildRecipes,
  getGuildRecipesUnique,
  getGuildCrafters,

  type Recipe,
  type UniqueRecipe,
type GuildCrafters,
} from "@/api/api";
import { useCapitaliser } from "@/composable/useString";

import GPForm from "@/components/GPForm.vue";
import GPCard from "@/components/GPCard.vue";

const { capitaliseFirstLetter } = useCapitaliser();

const uniqueRecipes = ref<Array<UniqueRecipe>>();
const allRecipes = ref<Array<Recipe>>();
const guildCrafters = ref<GuildCrafters>();
const isLoading = ref(false);
const failEventError = ref("");

const formValue = ref({
  guildName: "",
  realm: ""
})

const selectedValue = ref<string | undefined>(undefined);
const activeProfession = ref("");
const loadingText = ref("Fetching your guild's recipes");
const filteredRecipes = ref<Array<Recipe>>();

const someOptions = computed(() => {
  return uniqueRecipes.value?.map(recipe => ({
    label: recipe.recip_name,
    value: recipe.recip_name,
    prof_name: recipe.prof_name,
  })).filter(option => option.prof_name === activeProfession.value);
});

const baseProfessions = computed(() => {
  const thing = allRecipes.value?.map(recipe => recipe.prof_name);
  return Array.from(new Set(thing)).sort()
});

const formatGuildName = computed(() => formValue.value.guildName.replace(" ", "-").toLowerCase());

function pickRecipe(value: string) {
  filteredRecipes.value = allRecipes.value?.filter(recipe => recipe.recip_name === value);
}

function pickProfession(value: string) {
  activeProfession.value = value;
  filteredRecipes.value = [];
}

async function fetchAll() {
  const [uniqueRecipesResult, recipesResult, craftersResult] = await Promise.allSettled([
    getGuildRecipesUnique(formValue.value.realm, formatGuildName.value),
    getGuildRecipes(formValue.value.realm, formatGuildName.value),
    getGuildCrafters(formValue.value.realm, formatGuildName.value),
  ])

  if (uniqueRecipesResult.status === "rejected" || recipesResult.status === "rejected" || craftersResult.status === "rejected") {
    console.log("error")
    return
  }

  if (uniqueRecipesResult.status === "fulfilled" && recipesResult.status === "fulfilled" && craftersResult.status === "fulfilled") {
    uniqueRecipes.value = uniqueRecipesResult.value;
    allRecipes.value = recipesResult.value;
    guildCrafters.value = craftersResult.value;
  }
}

async function submitForm(errors: FormValidationError) {
  if (errors) {
    return;
  } else {
    isLoading.value = true;
    selectedValue.value = undefined;
    
    const source = await startStream(formValue.value.realm, formatGuildName.value);

    source.addEventListener("cacheCheck", async event => {
      if (event.data) {
        await fetchAll();
        source.close();

        failEventError.value = "";
        isLoading.value = false;
      }
    })

    source.addEventListener("progressCheck", event => {
      const eventData = JSON.parse(event.data);
      loadingText.value = `Fetching ${eventData.parse_number}/${eventData.parse_total} recipes - ${eventData.message}`;
    })

    source.addEventListener("fail", (event) => {
      failEventError.value = event.data;
      isLoading.value = false;
    })

    source.addEventListener("parseComplete", async () => {
      await fetchAll();
      
      failEventError.value = "";
      isLoading.value = false;
      loadingText.value = "Fetching your guild's recipes";

      source.close();
    })
  }
}
</script>

<template>
  <header class="gp-header">
    <n-h1 class="gp-title">
      <span class="gp-title-upper">G</span>UILD
      <span class="gp-title-upper">P</span>ROFESSIONS
    </n-h1>
  </header>
  <main class="gp-content">
    <n-alert v-if="failEventError" title="There is a problem" type="error" closable>
      {{ failEventError }}
    </n-alert>
    
    <n-spin :show="isLoading" size="large" content-class="test">
      <template #description>
        <span style="font-size: 1.5rem;">{{ loadingText }}</span>
      </template>

      <g-p-form v-model="formValue" @submit-form="submitForm"/>
    </n-spin>
    
    <n-h2 v-if="baseProfessions.length > 0">Pick a Profession</n-h2>
    <div class="gp-prof-picker">
      <button
        v-for="prof in baseProfessions"
        :key="prof"
        :class="['gp-prof-picker__action', prof === activeProfession ? 'gp-prof-picker__action--active' : '']"
        @click="pickProfession(prof)">
        <img :src="`./images/${prof}.jpg`" :alt="prof" class="gp-prof-picker__img"/>
        <!-- <img v-if="prof === activeProfession" src="/images/professions-tier-5.png" alt="selected profession"> -->
      </button>
    </div>
    
    <div v-if="activeProfession" class="gp-recipe-picker">
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
        @update:value="pickRecipe"/>
    </div>

    <template v-if="selectedValue">
      <g-p-card
        v-for="recipe in filteredRecipes"
        :key="recipe.recip_id"
        :filtered-recipe="recipe"
        :guild-crafters="guildCrafters!"/>
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
    content: " ";
    background-image: url("/images/professions.webp");
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
    box-shadow: rgba(0, 0, 0, 0.4) 0px 2px 4px, rgba(0, 0, 0, 0.3) 0px 7px 13px -3px, rgba(0, 0, 0, 0.2) 0px -3px 0px inset;
  }
}

.gp-recipe-picker {
  margin-bottom: 1rem;
  width: 75vw;
}

.gp-card {
  width: 75vw;
  margin-bottom: 1rem;

  &__content {
    display: flex;
    align-items: flex-end;
  }

  &__content-img {
    img {
      border-radius: 3px;
      margin-bottom: -0.5rem;
    }
    margin-right: 1rem;
  }

  &__content-info {
    font-size: 1.5rem;
    text-shadow: 2px 2px 2px rgba(0, 0, 0, 0.5);
  }
}
</style>
