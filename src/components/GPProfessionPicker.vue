<script setup lang="ts">
import { NH3 } from 'naive-ui'

defineProps<{ baseProfessions: Array<string>; activeProfession: string }>()

const emit = defineEmits(['update:activeProfession'])

function updateActiveProfession(prof: string) {
  emit('update:activeProfession', prof)
}
</script>

<template>
  <div class="gp-prof-picker">
    <n-h3 class="gp-prof-picker__title">Pick a Profession</n-h3>
    <div class="gp-prof-picker__content">
      <button
        v-for="prof in baseProfessions"
        :key="prof"
        :class="[
          'gp-prof-picker__action',
          prof === activeProfession ? 'gp-prof-picker__action--active' : ''
        ]"
        @click="updateActiveProfession(prof)"
      >
        <img
          :src="`/images/${prof}.jpg`"
          :alt="prof"
          :class="[
            'gp-prof-picker__img',
            activeProfession !== prof ? 'gp-prof-picker__img--inactive' : ''
          ]"
        />
      </button>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.gp-prof-picker {
  &__content {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  &__title {
    margin-bottom: 0.5rem;
    font-size: 1rem;

    @media screen and (min-width: 720px) {
      font-size: revert;
    }
  }

  &__action {
    padding: 0;
    border: none;
    background: none;
    cursor: pointer;
  }

  &__img {
    border-radius: 5px;
    box-shadow:
      rgba(0, 0, 0, 0.4) 0px 2px 4px,
      rgba(0, 0, 0, 0.3) 0px 7px 13px -3px,
      rgba(0, 0, 0, 0.2) 0px -3px 0px inset;

    &--inactive {
      opacity: 0.25;
    }

    &:hover {
      opacity: 1;
    }
  }
}
</style>
