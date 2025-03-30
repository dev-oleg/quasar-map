<template>
  <div class="map-wrapper">
    <LMap ref="map" v-model:zoom="zoom" :center="[51.505, -0.09]" class="map">
      <LTileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        layer-type="base"
        name="OpenStreetMap"
      />

      <LGeoJson v-if="data?.geojson" :geojson="data.geojson" />

      <div
        v-if="temp !== null"
        class="absolute-top-right z-max bg-white text-black text-h6 q-px-sm"
      >
        Температура: {{ tempDisplayed }}&deg;C
      </div>
    </LMap>
  </div>
</template>

<script setup lang="ts">
import type { LatLngLiteral, LatLngTuple } from 'leaflet';
import type { OSMdata } from 'src/types';
import { ref, computed, watch } from 'vue';
import { LGeoJson, LMap, LTileLayer } from '@vue-leaflet/vue-leaflet';
import 'leaflet/dist/leaflet.css';

const props = defineProps<{
  data: OSMdata | null;
  temp: number | null;
}>();

const map = ref<InstanceType<typeof LMap>>();

const zoom = ref<number>(10);

const tempDisplayed = computed<string | null>(() => {
  if (props.temp === null) return null;

  return new Intl.NumberFormat('ru', { signDisplay: 'exceptZero' }).format(props.temp);
});

watch(props, () => {
  console.log('geojson:', props.data);

  if (map.value && props.data) {
    const { lat, lon, boundingbox } = props.data;

    const params: LatLngLiteral = { lat: +lat, lng: +lon };

    map.value.leafletObject?.panTo(params);

    const [sw_lat, ne_lat, sw_lng, ne_lng] = boundingbox.map((item) => +item);
    const sw: LatLngTuple = [sw_lat!, sw_lng!];
    const ne: LatLngTuple = [ne_lat!, ne_lng!];

    map.value.leafletObject?.fitBounds([sw, ne]);
  }
});
</script>

<style scoped lang="scss">
.map-wrapper {
  height: 1000px;
}

.map {
  :deep(.leaflet-bottom.leaflet-right) {
    display: none;
  }
}
</style>
