<template>
  <q-page>
    <div class="wrapper row q-col-gutter-md q-pa-md">
      <div class="col-8">
        <q-card>
          <q-card-section>
            <LeafletMap :data="activeEl" :temp="temp" />
          </q-card-section>
        </q-card>
      </div>

      <div class="col-4">
        <q-card class="data-card">
          <q-card-section>
            <q-input
              v-model="searchText"
              label="Введите текст"
              outlined
              clearable
              @keyup.enter="search"
            />

            <div class="row justify-end q-mt-md">
              <q-toggle v-model="hasWeather" label="Погода" />

              <q-space />

              <q-btn label="Очистить" color="primary" class="q-mr-md" @click="clear" />

              <q-btn label="Поиск" color="primary" @click="search" />
            </div>
          </q-card-section>

          <q-separator />

          <q-card-section v-if="isLoading">
            <div class="loading-wrapper">
              <q-inner-loading showing />
            </div>
          </q-card-section>

          <q-card-section v-else-if="searchData.length" class="data-card__results">
            <q-list v-for="item in searchData" :key="item.osm_id" bordered separator>
              <q-item
                clickable
                :active="item.osm_id === activeEl?.osm_id"
                active-class="active-item"
                @click="setActiveEl(item)"
              >
                <q-item-section>
                  {{ item.display_name }}
                </q-item-section>
              </q-item>
            </q-list>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import type { OSMdata, OWMdata } from 'src/types';
import { ref } from 'vue';
import { api } from 'boot/axios';
import { storeToRefs } from 'pinia';
import { Notify } from 'quasar';
import LeafletMap from 'components/LeafletMap.vue';
import { useApiKeyStore } from 'stores/apiKeyStore';

const apiKeyStore = useApiKeyStore();
const { apiKey } = storeToRefs(apiKeyStore);

const isLoading = ref<boolean>(false);
const searchText = ref<string>('');
const searchData = ref<Array<OSMdata>>([]);

const activeEl = ref<OSMdata | null>(null);

const hasWeather = ref<boolean>(false);
const temp = ref<number | null>(null);

function clear() {
  searchText.value = '';
  searchData.value = [];
  activeEl.value = null;
  temp.value = null;
}

async function search() {
  if (!searchText.value) {
    Notify.create({
      message: 'Поисковый запрос не может быть пустым',
      type: 'negative',
    });

    return;
  }

  searchData.value = [];
  activeEl.value = null;

  try {
    isLoading.value = true;

    const { data } = await api<Array<OSMdata>>({
      baseURL: '/osm:/',
      method: 'GET',
      params: {
        q: searchText.value,
        polygon_geojson: 1,
        limit: 100,
        format: 'json',
      },
    });

    console.log('data:', data);

    searchData.value = data;

    if (!data.length) {
      Notify.create({
        message: 'По Вашему запросу ничего не найдено',
        type: 'negative',
      });
    }
  } catch (e) {
    console.error(e);
  } finally {
    isLoading.value = false;
  }
}

async function getWeather() {
  if (!apiKey.value) {
    Notify.create({
      message: 'Для запроса погоды нужен API KEY сервиса OpenWeather',
      type: 'negative',
    });

    return;
  }

  try {
    const { lat, lon } = activeEl.value!;

    const { data } = await api<OWMdata>({
      baseURL: '/owm:/',
      method: 'GET',
      params: {
        lat,
        lon,
        appid: apiKey.value,
      },
    });

    console.log('weather:', data);

    temp.value = Math.round(data.main.temp - 273);
  } catch (e) {
    console.error(e);
  }
}

async function setActiveEl(value: OSMdata) {
  activeEl.value = value;
  temp.value = null;

  if (activeEl.value && hasWeather.value) await getWeather();
}
</script>

<style scoped lang="scss">
.wrapper {
  max-height: calc(100vh - 50px);
}

.data-card {
  max-height: calc(100vh - 82px);
  display: grid;
  grid-template-rows: max-content max-content 1fr;

  &__results {
    overflow-y: auto;
  }
}

.active-item {
  background-color: #1976d2;
  color: #fff;
}

.loading-wrapper {
  height: 60px;
}
</style>
