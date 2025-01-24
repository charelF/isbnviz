import "./style.css";
import { Map, View } from "ol";
import WebGLTile from "ol/layer/WebGLTile";
import { PMTilesRasterSource } from "ol-pmtiles";
import { useGeographic } from 'ol/proj';

const rasterLayer = new WebGLTile({
  source: new PMTilesRasterSource({
    url:"https://r2-public.protomaps.com/protomaps-sample-datasets/terrarium_z9.pmtiles",
    attributions:["https://github.com/tilezen/joerd/blob/master/docs/attribution.md"],
    tileSize: [512,512]
  })
});

useGeographic();

const map = new Map({
  target: "map",
  layers: [rasterLayer],
  view: new View({
    center: [0,0],
    zoom: 1,
  }),
});