<script setup lang="ts">
import { computed, ref } from 'vue'
import { NH1, NAlert, NCard, type FormValidationError } from 'naive-ui'
import { useEventSource } from '@/composable/useEventSource'

import GPForm from '@/components/GPForm.vue'

const formValue = ref({
  realm: '',
  guildName: ''
})

const formatGuildName = computed(() => formValue.value.guildName.replace(/ /g, '-').toLowerCase())

const {
  startStream,
  eventProgress,

  foundCheckHandler
} = useEventSource()

async function submitForm(errors: FormValidationError) {
  if (errors) {
    return
  } else {
    const searchParams = new URLSearchParams({
      guildname: formatGuildName.value,
      realm: formValue.value.realm
    })

    startStream(searchParams)

    foundCheckHandler({
      name: 'professions',
      params: {
        realm: formValue.value.realm,
        guild: formatGuildName.value
      }
    })
  }
}
</script>

<template>
  <header class="gp-header">
    <n-h1 class="gp-title">
      <span class="gp-title-upper">G</span>UILD <span class="gp-title-upper">P</span>ROFESSIONS
    </n-h1>
  </header>
  <main class="gp-content">
    <n-alert
      v-if="!eventProgress.foundCheck.found"
      title="There is a problem"
      type="error"
      closable
    >
      {{ eventProgress.foundCheck.message }}
    </n-alert>

    <n-card class="gp-card">
      <g-p-form
        v-model="formValue"
        @submit-form="submitForm"
        :is-disabled="eventProgress.isLoading"
      />
    </n-card>
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
    content: ' ';
    background-image: url('/images/professions.webp');
    background-repeat: no-repeat;

    height: 83px;
    width: 180px;
    background-position-y: bottom;
  }
}

.gp-title {
  margin-bottom: 0;
  font-size: 1.2rem;

  @media screen and (min-width: 720px) {
    font-size: 1.7rem;
  }

  &-upper {
    font-size: 1.7rem;

    @media screen and (min-width: 720px) {
      font-size: 2rem;
    }
  }
}

.gp-card {
  margin-bottom: 1rem;

  @media screen and (min-width: 720px) {
    width: 75vw;
  }
}
</style>
