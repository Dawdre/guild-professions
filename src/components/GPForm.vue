<script setup lang="ts">
import { computed, ref } from "vue";
import {
  NSelect,
  NForm,
  NFormItem,
  NInput,
  NButton,
  type FormInst 
} from "naive-ui";
import {
  getRealmList,

  type Realm,
} from "@/api/api";

const emit = defineEmits(["submitForm", "update:modelValue"]);
const props = defineProps<{ modelValue: { realm: string, guildName: string } }>();

const inputValue = computed({
  get: () => props.modelValue,
  set: (value) => emit("update:modelValue", value)
})

const formRef = ref<FormInst | null>(null);
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

const realms = ref<Array<Realm>>();
realms.value = await getRealmList();

const realmOptions = computed(() => {
  return realms.value?.map(realm => ({
    label: realm.name,
    value: realm.slug
  }))
})

async function submit() {
  try {
    await formRef.value?.validate(errors => emit("submitForm", errors));
  } catch (errors) {
    console.log(errors, "error");
  }
}
</script>

<template>
  <n-form ref="formRef" :model="inputValue" :rules="formRules" class="gp-form">
    <n-form-item label="Select a realm" path="realm">
      <n-select
        v-model:value="inputValue.realm"
        :options="realmOptions"
        filterable
        clearable/>
    </n-form-item>

    <n-form-item label="Enter your guild name" path="guildName">
      <n-input
        v-model:value="inputValue.guildName"
        placeholder=""
        :input-props="{ autocomplete: 'on' }"/>
    </n-form-item>

    <n-button type="primary" size="large" @click="submit">
      Find my guild
    </n-button>
  </n-form>
</template>

<style lang="scss" scoped>
  .gp-form {
    width: 75vw;
  }
</style>