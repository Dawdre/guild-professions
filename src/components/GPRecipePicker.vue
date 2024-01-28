<script setup lang="ts">
import { computed } from 'vue'
import { NSelect } from 'naive-ui'
import { useStringUtils } from '@/composable/useString'
import type { UniqueRecipe } from '@/api/api'

const { capitaliseFirstLetter } = useStringUtils()

const props = defineProps<{
  uniqueRecipes: Array<UniqueRecipe>
  modelValue: string | undefined
  activeProfession: string
}>()
const emit = defineEmits(['update:modelValue', 'pickRecipe'])

const inputValue = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})
const recipeOptions = computed(() => {
  return props.uniqueRecipes
    ?.map((recipe) => ({
      label: recipe.recip_name,
      value: recipe.recip_name,
      prof_name: recipe.prof_name
    }))
    .filter((options) => options.prof_name === props.activeProfession)
})

const pickRecipe = (value: string) => emit('pickRecipe', value)
</script>
<template>
  <div class="gp-recipe-picker">
    <n-h3 class="gp-recipe-picker__title">
      <label for="recipe-select" class="gp-recipe-picker__label">
        Find a {{ capitaliseFirstLetter(activeProfession).value }} recipe
      </label>
    </n-h3>
    <n-select
      v-model:value="inputValue"
      id="recipe-select"
      filterable
      clearable
      :options="recipeOptions"
      placeholder="Select or search for a recipe"
      size="large"
      @update:value="pickRecipe"
    />
  </div>
</template>
<style lang="scss" scoped>
.gp-recipe-picker {
  &__title {
    margin-bottom: 0.5rem;
    font-size: 1rem;

    @media screen and (min-width: 720px) {
      font-size: revert;
    }
  }
}
</style>
