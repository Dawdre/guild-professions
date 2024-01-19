<script setup lang="ts">
import { computed } from 'vue'
import { NCard, NSkeleton } from 'naive-ui'
import { type GuildCrafters, type Recipe, type RecipeDetails } from '@/api/api'
import { useStringUtils } from '@/composable/useString'

const { capitaliseFirstLetter } = useStringUtils()

const props = defineProps<{
  filteredRecipe: Recipe
  guildCrafters: GuildCrafters
  recipeDetails: RecipeDetails
}>()

const findCrafterInfo = computed(() => {
  return props.guildCrafters.crafters.find(
    (crafter) => crafter.char_name === props.filteredRecipe.char_name
  )
})

const findCrafterTier = computed(() => {
  return props.guildCrafters.crafters
    .find((crafter) => crafter.char_name === props.filteredRecipe.char_name)
    ?.tier_list.find((tier) => tier.tier_name === props.filteredRecipe.recip_tier_name)?.tier_name
})
</script>

<template>
  <n-card class="gp-recipe" content-style="padding: 1rem;" hoverable>
    <div class="gp-recipe__content">
      <div class="gp-recipe__header">
        <div class="gp-recipe__header-img">
          <img :src="findCrafterInfo?.char_avatar" :alt="props.filteredRecipe.char_name" />
        </div>
        <div class="gp-recipe__header-content">
          <div
            class="gp-recipe__header-content-title"
            :style="`color: ${findCrafterInfo?.class_color};`"
          >
            {{ capitaliseFirstLetter(props.filteredRecipe.char_name).value }}
          </div>
          <div class="gp-recipe__data-item">
            <div class="gp-recipe__data-item-title">Total recipes known</div>
            <div class="gp-recipe__data-item-value gp-recipe__data-item-value--header">
              {{ findCrafterInfo?.total_known_recipes }}
            </div>
          </div>
        </div>
      </div>
      <div class="gp-recipe__content-info">
        <div class="gp-recipe__data-items gp-recipe__data-items--recipe">
          <img
            v-if="props.recipeDetails.iconURL"
            class="gp-recipe__content-img"
            :src="props.recipeDetails?.iconURL"
            :alt="props.recipeDetails?.name"
          />
          <n-skeleton v-else :sharp="false" :height="56" :width="56" />
          <div class="gp-recipe__data-item">
            <div class="gp-recipe__data-item-title">{{ findCrafterTier }}</div>
            <div class="gp-recipe__data-item-value gp-recipe__data-item-value--recipe">
              {{ props.filteredRecipe.recip_name }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </n-card>
</template>

<style lang="scss" scoped>
.gp-recipe {
  margin-bottom: 1rem;
  text-shadow: 2px 2px 2px rgba(0, 0, 0, 0.5);

  @media screen and (min-width: 720px) {
    width: 75vw;
  }

  &__header {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;

    &-img {
      img {
        height: 60px;
        border-radius: 3px;

        @media screen and (min-width: 720px) {
          height: auto;
        }
      }

      @media screen and (min-width: 720px) {
        display: flex;
      }
    }

    &-content {
      display: flex;
      flex-flow: column;
      justify-content: center;

      &-title {
        font-size: 1.2rem;
        line-height: 1;

        @media screen and (min-width: 720px) {
          font-size: 1.5rem;
        }
      }
    }
  }

  &__collapse {
    margin-bottom: 1rem;
  }

  &__content {
    display: flex;
    align-items: center;
    justify-content: space-between;

    &-img {
      border-radius: 3px;
      order: 1;

      @media screen and (min-width: 720px) {
        display: flex;
        order: 0;
      }
    }

    &-info {
      font-size: 1.5rem;
      margin-right: 0.5rem;
      text-align: right;

      @media screen and (min-width: 720px) {
        text-align: left;
      }
    }
  }

  &__data-items {
    display: flex;
    flex-flow: wrap;
    align-items: flex-end;
    gap: 0.5rem;

    &--recipe {
      flex-wrap: nowrap;
      align-items: flex-start;

      @media screen and (min-width: 480px) {
        align-items: center;
      }

      @media screen and (min-width: 720px) {
        flex-flow: wrap;
      }

      .gp-recipe__data-item-value {
        font-size: 0.9rem;

        @media screen and (min-width: 720px) {
          font-size: 1.2rem;
        }
      }
    }
  }

  &__data-item {
    display: flex;
    flex-flow: column;

    &--total {
      margin-bottom: 1.5rem;
    }

    &-title {
      font-size: 1rem;
      color: #7a7a7a;
    }

    &-value {
      margin-top: -0.2rem;
      margin-bottom: -0.4rem;

      &--header {
        font-size: initial;
      }
    }
  }
}
</style>
