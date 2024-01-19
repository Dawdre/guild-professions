import { getGuildRecipesUnique, type Crafter, getGuildRecipes, getGuildCrafters } from '@/api/api';
import { computed, ref } from 'vue';

export function useProfessions() {
  const crafters = ref<Array<Crafter>>();

  const findCrafterInfo = (name: string) => computed(() => {
    return crafters.value?.find(crafter => crafter.char_name === name);
  })

  async function fetchAll(realm: string, guildName: string) {
    const [uniqueRecipesResult, recipesResult, craftersResult] = await Promise.allSettled([
      getGuildRecipesUnique(realm, guildName),
      getGuildRecipes(realm, guildName),
      getGuildCrafters(realm, guildName),
    ]);

    if (uniqueRecipesResult.status === "rejected" || recipesResult.status === "rejected" || craftersResult.status === "rejected") {
      console.log("error")
      return
    }

    if (uniqueRecipesResult.status === "fulfilled" && recipesResult.status === "fulfilled" && craftersResult.status === "fulfilled") {
      return { uniqueRecipesResult, recipesResult, craftersResult }
    }
  }
  
  return {
    crafters,

    fetchAll,
  };
}
