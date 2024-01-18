<script setup lang="ts">
import { computed } from 'vue'
import { NCard } from 'naive-ui'
import { type GuildCrafters, type Recipe } from '@/api/api'
import { useStringUtils } from '@/composable/useString'

const { capitaliseFirstLetter } = useStringUtils()

const props = defineProps<{ filteredRecipe: Recipe; guildCrafters: GuildCrafters }>()

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
      <div class="gp-recipe__content-info">
        <div class="gp-recipe__content-title">
          <span :style="`color: ${findCrafterInfo?.class_color};`">
            {{ capitaliseFirstLetter(props.filteredRecipe.char_name).value }}
          </span>
          <div class="gp-recipe__content-caption">
            Total known recipes {{ findCrafterInfo?.total_known_recipes }}
          </div>
        </div>
        <div>{{ props.filteredRecipe.recip_name }}</div>
        <div>{{ findCrafterTier }}</div>
      </div>
      <div class="gp-recipe__content-img">
        <img :src="findCrafterInfo?.char_avatar" :alt="props.filteredRecipe.char_name" />
      </div>
    </div>
  </n-card>
</template>

<style lang="scss" scoped>
.gp-recipe {
  margin-bottom: 1rem;

  @media screen and (min-width: 640px) {
    width: 75vw;
  }

  &__content {
    display: flex;
    align-items: center;
    justify-content: space-between;

    &-caption {
      font-size: 1rem;
      color: #7a7a7a;
      margin-top: -0.4rem;
    }
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
