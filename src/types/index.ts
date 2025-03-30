import type { GeoJsonObject } from 'geojson';

export interface OSMdata {
  osm_id: number;
  display_name: string;
  lat: string;
  lon: string;
  geojson: GeoJsonObject;
  boundingbox: [string, string, string, string];
}

export interface OWMdata {
  main: {
    temp: number;
  };
}
