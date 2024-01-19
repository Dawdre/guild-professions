<script setup lang="ts">
import { computed, ref } from 'vue'
import { NSelect, NForm, NFormItem, NInput, NButton, NSkeleton, type FormInst } from 'naive-ui'
import { getRealmList } from '@/api/api'
import { useAsyncState } from '@vueuse/core'

const emit = defineEmits(['submitForm', 'update:modelValue'])
const props = defineProps<{
  modelValue: { realm: string; guildName: string }
  isDisabled: boolean
}>()

const inputValue = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const formRef = ref<FormInst | null>(null)
const formRules = {
  realm: {
    required: true,
    message: 'Select a realm'
  },
  guildName: {
    required: true,
    message: 'Enter a guild name'
  }
}

const { state, isLoading } = useAsyncState(getRealmList, [])

const realmOptions = computed(() => {
  return state.value?.map((realm) => ({
    label: realm.name,
    value: realm.slug
  }))
})

async function submit() {
  try {
    await formRef.value?.validate((errors) => emit('submitForm', errors))
  } catch (errors) {
    console.log(errors, 'error')
  }
}
</script>

<template>
  <div>
    <template v-if="isLoading">
      <n-skeleton text style="width: 20%" />
      <n-skeleton :sharp="false" :height="40" style="margin-bottom: 1rem" />
      <n-skeleton text style="width: 20%" />
      <n-skeleton :sharp="false" :height="40" />
    </template>
    <n-form v-else ref="formRef" :model="inputValue" :rules="formRules" class="gp-form">
      <n-form-item label="Select a realm" path="realm">
        <n-select v-model:value="inputValue.realm" :options="realmOptions" filterable clearable />
      </n-form-item>

      <n-form-item label="Enter your guild name" path="guildName">
        <n-input
          v-model:value="inputValue.guildName"
          placeholder=""
          :input-props="{ autocomplete: 'on' }"
        />
      </n-form-item>

      <n-button
        class="gp-form__action"
        type="primary"
        size="large"
        @click="submit"
        :disabled="isDisabled"
      >
        Find my guild
      </n-button>
    </n-form>
  </div>
</template>

<style lang="scss" scoped>
.gp-form {
  &__action {
    width: 100%;

    @media screen and (min-width: 720px) {
      width: initial;
    }
  }
}
</style>
