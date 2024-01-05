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
  type FormInst 
} from "naive-ui";
import {
  startStream,
  getGuildRecipes,
  getGuildRecipesUnique,
  getGuildCrafters,

  type Recipe,
  type UniqueRecipe,
  type Crafter,
} from "@/api/api";

const uniqueRecipes = ref<Array<UniqueRecipe>>();
const allRecipes = ref<Array<Recipe>>();
const crafters = ref<Array<Crafter>>();
const isLoading = ref(false);

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
const filteredRecipes = ref<Array<Recipe>>();

const someOptions = computed(() => {
  return uniqueRecipes.value?.map(recipe => ({
    label: recipe.recip_name,
    value: recipe.recip_name,
    prof_name: recipe.prof_name,
  })).filter(option => option.prof_name === activeProfession.value);
});

const realmOptions = computed(() => {
  return [
    { label: "Silvermoon", value: "silvermoon"},
    { label: "Doomhammer", value: "doomhammer"},
  ]
})

const baseProfessions = computed(() => {
  const thing = allRecipes.value?.map(recipe => recipe.prof_name);
  return Array.from(new Set(thing)).sort()
});

const findCrafterInfo = (name: string) => computed(() => {
  return crafters.value?.find(crafter => crafter.char_name === name);
})

const capitaliseFirstLetter = (word: string) => computed(() => `${word.charAt(0).toUpperCase()}${word.slice(1)}`)

function pickRecipe(value: string) {
  filteredRecipes.value = allRecipes.value?.filter(recipe => recipe.recip_name === value);
}

async function submitForm(event: Event) {
  event.preventDefault();
  isLoading.value = true;

  formRef.value?.validate(errors => {
    !errors ? console.log("valid") : console.log("invalid")
    return
  })

  const guildNameFormatted = formValue.value.guildName.replace(" ", "-").toLowerCase();

  const source = await startStream(formValue.value.realm, guildNameFormatted);

  source.addEventListener("message", async () => {
    const [uniqueRecipesResult, recipesResult, craftersResult] = await Promise.allSettled([
      getGuildRecipesUnique(formValue.value.realm, guildNameFormatted),
      getGuildRecipes(formValue.value.realm, guildNameFormatted),
      getGuildCrafters(formValue.value.realm, guildNameFormatted),
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
    
    isLoading.value = false

    source.close();
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
    <n-spin :show="isLoading" size="large" content-class="test">
      <template #description>
        <span style="font-size: 1.5rem;">Fetching your guild's recipes</span>
      </template>

      <n-form ref="formRef" :model="formValue" :rules="formRules">
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
            :input-props="{ autocomplete: 'on', id: 'guild-name', name: 'guild-name' }"/>
        </n-form-item>
        <n-button type="primary" size="large" @click="submitForm">Find my guild</n-button>
      </n-form>
    </n-spin>
    
    <n-h2>Pick a Profession</n-h2>

    <div class="gp-prof-picker">
      <button
        v-for="prof in baseProfessions"
        :key="prof"
        :class="['gp-prof-picker__action', prof === activeProfession ? 'gp-prof-picker__action--active' : '']"
        @click="activeProfession = prof">
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
        hoverable>
        <template #header>
          <img :src="findCrafterInfo(recipe.char_name).value?.char_avatar" :alt="recipe.char_name">
          <span :style="`color: ${findCrafterInfo(recipe.char_name).value?.class_color};`">
            {{ capitaliseFirstLetter(recipe.char_name).value }}
          </span>
        </template>
        <div>{{ recipe.recip_name }}</div>
        <div>{{ recipe.char_realm }}</div>
        <img :src="findCrafterInfo(recipe.char_name).value?.class_icon" :alt="recipe.char_name">
      </n-card>
    </template>
  </main>
</template>

<style lang="scss" scoped>
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
}
</style>
