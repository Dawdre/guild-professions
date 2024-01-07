import { computed } from 'vue';

export function useCapitaliser() {
  return {
    capitaliseFirstLetter: (word: string) => computed(() => {
      if (typeof word !== 'string') return;

      return word.charAt(0).toUpperCase() + word.slice(1);
    }),
  };
}
