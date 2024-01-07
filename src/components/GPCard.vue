<script setup lang="ts">
import { computed } from "vue";
import { NCard } from "naive-ui";
import { type GuildCrafters, type Recipe } from "@/api/api";
import { useCapitaliser } from "@/composable/useString";

const { capitaliseFirstLetter } = useCapitaliser();

const props = defineProps<{ filteredRecipe: Recipe, guildCrafters: GuildCrafters }>();

const findCrafterInfo = computed(() => {
  return props.guildCrafters.crafters
    .find(crafter => crafter.char_name === props.filteredRecipe.char_name);
})

const findCrafterTier = computed(() => {
  return props.guildCrafters.crafters
    .find(crafter => crafter.char_name === props.filteredRecipe.char_name)?.tier_list
    .find(tier => tier.tier_name === props.filteredRecipe.recip_tier_name)?.tier_name;
})

</script>

<template>
  <n-card class="gp-card" content-style="padding: 1rem;" hoverable>
    <div class="gp-card__content">
      <div class="gp-card__content-img">
        <img 
          class="gp-card__header-img"
          :src="findCrafterInfo?.char_avatar"
          :alt="props.filteredRecipe.char_name"/>
      </div>
      <div class="gp-card__content-info">
        <div class="gp-card__content-text" :style="`color: ${findCrafterInfo?.class_color};`">
          {{ capitaliseFirstLetter(props.filteredRecipe.char_name).value }}
        </div>
        <div>{{ props.filteredRecipe.recip_name }}</div>
        <div>{{ findCrafterTier }}</div>
      </div>
    </div>
  </n-card>
</template>

<style lang="scss" scoped>
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