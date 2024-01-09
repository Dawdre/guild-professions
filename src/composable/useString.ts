import { computed } from 'vue';

export function useStringUtils() {
  const capitaliseFirstLetter = (word: string) => computed(() => {
    if (typeof word !== 'string') return;

    return word.charAt(0).toUpperCase() + word.slice(1);
  }) 

  const sentenceCase = (word: string) => computed(() => {
    if (typeof word !== 'string') return;

    return word
      .toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }) 

  return {
    capitaliseFirstLetter,
    sentenceCase,
  }
}
