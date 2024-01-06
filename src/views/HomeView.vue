<script setup lang="ts">
import { computed, ref } from "vue";
import {
  NSelect,
  NH1,
  NH2,
  NCard,
  NForm,
  NFormItem,
  NInput,
  NButton,
  NSpin,
  NAlert,
  type FormInst 
} from "naive-ui";
import {
  startStream,
  getRealmList,
  getGuildRecipes,
  getGuildRecipesUnique,
  getGuildCrafters,

  type Realm,
  type Recipe,
  type UniqueRecipe,
  type Crafter,
} from "@/api/api";

const realms = ref<Array<Realm>>();
realms.value = await getRealmList();

const uniqueRecipes = ref<Array<UniqueRecipe>>();
const allRecipes = ref<Array<Recipe>>();
const crafters = ref<Array<Crafter>>();
const isLoading = ref(false);
const showEventError = ref(false);

const formRef = ref<FormInst | null>(null);
const formValue = ref({
  guildName: "",
  realm: ""
})
const formRules = {
  realm: {
    required: true,
    message: "Select a realm"
  },
  guildName: {
    required: true,
    message: "Enter a guild name"
  }
}

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

const realmOptions = computed(() => {
  return realms.value?.map(realm => ({
    label: realm.name,
    value: realm.slug
  }))
})

const baseProfessions = computed(() => {
  const thing = allRecipes.value?.map(recipe => recipe.prof_name);
  return Array.from(new Set(thing)).sort()
});

const findCrafterInfo = (name: string) => computed(() => {
  return crafters.value?.find(crafter => crafter.char_name === name);
})

const capitaliseFirstLetter = (word: string) => computed(() => `${word.charAt(0).toUpperCase()}${word.slice(1)}`)
const formatGuildName = computed(() => formValue.value.guildName.replace(" ", "-").toLowerCase());

function pickRecipe(value: string) {
  filteredRecipes.value = allRecipes.value?.filter(recipe => recipe.recip_name === value);
}

function pickProfession(value: string) {
  activeProfession.value = value;
  filteredRecipes.value = []
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
    crafters.value = craftersResult.value;
  }
}

async function submitForm(event: Event) {
  event.preventDefault();

  formRef.value?.validate(async errors => {
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

          isLoading.value = false;
        }
      })

      source.addEventListener("progressCheck", event => {
        const eventData = JSON.parse(event.data);
        loadingText.value = `Fetching ${eventData.parse_number}/${eventData.parse_total} recipes - ${eventData.message}`;
      })

      source.addEventListener("fail", () => {
        showEventError.value = true;
        isLoading.value = false;
      })

      source.addEventListener("parseComplete", async () => {
        await fetchAll();
        
        isLoading.value = false
        loadingText.value = "Fetching your guild's recipes";

        source.close();
      })
    }
  })
}
</script>

<template>
  <header class="gp-header">
    <n-h1 class="gp-title">
      <span class="gp-title-upper">G</span>UILD <span class="gp-title-upper">P</span>ROFESSIONS
    </n-h1>
  </header>
  <main class="gp-content">
    <n-alert v-if="showEventError" title="There is a problem" type="error" closable>
      There is no guild with that name on that realm
    </n-alert>
    <n-spin :show="isLoading" size="large" content-class="test">
      <template #description>
        <span style="font-size: 1.5rem;">{{ loadingText }}</span>
      </template>

      <n-form ref="formRef" :model="formValue" :rules="formRules" class="gp-form">
        <n-form-item label="Select a realm" path="realm">
          <n-select
            v-model:value="formValue.realm"
            :options="realmOptions"
            filterable
            clearable/>
        </n-form-item>
        <n-form-item label="Enter your guild name" path="guildName" :label-props="{ for: 'guild-name' }">
          <n-input
            v-model:value="formValue.guildName"
            placeholder=""
            :input-props="{ class: 'gp-form__input', autocomplete: 'on', id: 'guild-name', name: 'guild-name' }"/>
        </n-form-item>
        <n-button type="primary" size="large" @click="submitForm">Find my guild</n-button>
      </n-form>
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
      <n-card
        v-for="recipe in filteredRecipes"
        :key="recipe.recip_id"
        class="gp-card"
        content-style="padding: 1rem;"
        hoverable>
        <div class="gp-card__content">
          <div class="gp-card__content-img">
            <img 
              class="gp-card__header-img"
              :src="findCrafterInfo(recipe.char_name).value?.char_avatar"
              :alt="recipe.char_name"/>
          </div>
          <div class="gp-card__content-info">
            <div class="gp-card__content-text" :style="`color: ${findCrafterInfo(recipe.char_name).value?.class_color};`">
              {{ capitaliseFirstLetter(recipe.char_name).value }}
            </div>
            <div>{{ recipe.recip_name }}</div>
          </div>
        </div>
      </n-card>
    </template>
  </main>
</template>

<style lang="scss" scoped>
.n-alert {
  margin-bottom: 1rem;
  width: 75vw;
}
.n-input__input-el:-webkit-autofill {
  -webkit-text-fill-color: rgba(255, 255, 255, 0.82);
  -webkit-box-shadow: 0 0 0px 1000px #282828 inset;
  transition: background-color 5000s ease-in-out 0s;
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

.gp-form {
  width: 75vw;
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
