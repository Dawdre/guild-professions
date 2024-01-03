<script setup lang="ts">
import { computed, ref } from "vue";
import { NSelect, NH1, NH2, NCard } from "naive-ui";
import {
  getGuildRecipes,
  getGuildRecipesUnique,
  type Recipe,
  type UniqueRecipe
} from "@/api/api";

const uniqueRecipes = ref<Array<UniqueRecipe>>();
const allRecipes = ref<Array<Recipe>>();

uniqueRecipes.value = await getGuildRecipesUnique();
allRecipes.value = await getGuildRecipes();

const selectedValue = ref(undefined);
const activeProfession = ref("");
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

function pickRecipe(value: string) {
  filteredRecipes.value = allRecipes.value?.filter(recipe => recipe.recip_name === value);
}
</script>

<template>
  <main>
    <n-h1>Find a guild recipe</n-h1>
    
    <n-h2>Pick a profession</n-h2>
    <button
      v-for="prof in baseProfessions"
      :key="prof"
      :class="['prof-picker', prof === activeProfession ? 'prof-picker--active' : '']"
      @click="activeProfession = prof">
      <img :src="`src/assets/${prof}.jpg`" :alt="prof" class="prof-picker__img"/>
    </button>
    
    <n-select
      v-if="activeProfession"
      v-model:value="selectedValue"
      filterable
      :options="someOptions"
      @update:value="pickRecipe"/>
    
    <template v-if="selectedValue">
      <n-card v-for="recipe in filteredRecipes" :key="recipe.recip_id" :title="recipe.char_name" hoverable>
        <div>{{ recipe.recip_name }}</div>
        <div>{{ recipe.char_realm }}</div>
      </n-card>
    </template>
  </main>
</template>

<style lang="scss" scoped>
.prof-picker {
  border: none;
  background: none;
  cursor: pointer;
  
  &--active {
    border: 3px solid red;
  }
  
  &__img {
    border-radius: 5px;
    box-shadow: rgba(0, 0, 0, 0.4) 0px 2px 4px, rgba(0, 0, 0, 0.3) 0px 7px 13px -3px, rgba(0, 0, 0, 0.2) 0px -3px 0px inset;
  }
}
</style>
