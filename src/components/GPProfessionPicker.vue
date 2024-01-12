<script setup lang="ts">
import { NH3 } from 'naive-ui'

defineProps<{ baseProfessions: Array<string>; activeProfession: string }>()

const emit = defineEmits(['update:activeProfession'])

function updateActiveProfession(prof: string) {
  emit('update:activeProfession', prof)
}
</script>

<template>
  <n-h3>Pick a Profession</n-h3>
  <div class="gp-prof-picker">
    <button
      v-for="prof in baseProfessions"
      :key="prof"
      :class="[
        'gp-prof-picker__action',
        prof === activeProfession ? 'gp-prof-picker__action--active' : ''
      ]"
      @click="updateActiveProfession(prof)"
    >
      <img :src="`/images/${prof}.jpg`" :alt="prof" class="gp-prof-picker__img" />
    </button>
  </div>
</template>

<style lang="scss" scoped>
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
    box-shadow:
      rgba(0, 0, 0, 0.4) 0px 2px 4px,
      rgba(0, 0, 0, 0.3) 0px 7px 13px -3px,
      rgba(0, 0, 0, 0.2) 0px -3px 0px inset;
  }
}
</style>
