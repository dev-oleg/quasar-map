import { ref } from 'vue';
import { defineStore } from 'pinia';

export const useApiKeyStore = defineStore('API_KEY', () => {
  const apiKey = ref<string>('');

  function changeApiKey(value: string) {
    apiKey.value = value;
  }

  return {
    apiKey,
    changeApiKey,
  };
});
