<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>
        <q-toolbar-title> Quasar App </q-toolbar-title>

        <div>
          <q-input
            :model-value="apiKey"
            label="API KEY"
            outlined
            dense
            class="q-mr-sm bg-white"
            @update:model-value="changeApiKey"
          />
        </div>

        <div>Quasar v{{ $q.version }}</div>
      </q-toolbar>
    </q-header>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import type { QInputProps } from 'quasar';
import { storeToRefs } from 'pinia';
import { useApiKeyStore } from 'stores/apiKeyStore';

const apiKeyStore = useApiKeyStore();
const { apiKey } = storeToRefs(apiKeyStore);

function changeApiKey(value: QInputProps['modelValue']) {
  apiKeyStore.changeApiKey(value as string);
}
</script>
