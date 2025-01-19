import Map from 'ol/Map.js';
import TileLayer from 'ol/layer/Tile.js';
import View from 'ol/View.js';
import Zoomify from 'ol/source/Zoomify.js';
import Projection from 'ol/proj/Projection.js';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import GeoJSON from 'ol/format/GeoJSON';
import { getCenter } from 'ol/extent.js';

// Define the extent to match your GeoJSON coordinates
const extent = [0, 0, 4096, 4096];

const projection = new Projection({
  code: 'isbn-image',
  units: 'pixels',
  extent: extent,
});

const vectorSource2 = new VectorSource({
  url: 'geo.json',
  format: new GeoJSON({
    dataProjection: projection,
    featureProjection: projection
  })
});

const vectorLayer2 = new VectorLayer({
  source: vectorSource2
});

// Setup Zoomify source with adjusted positioning
const retinaPixelRatio = 2;
const retinaSource = new Zoomify({
  url: 'zoomify/image/',
  size: [4096, 4096],
  crossOrigin: 'anonymous',
  projection: projection,
  interpolate: false,
  zDirection: -1,
  tilePixelRatio: retinaPixelRatio,
  tileSize: 256 / retinaPixelRatio,
  extent: extent  // Set the same extent as the projection
});

const zoomifyLayer = new TileLayer({
  source: retinaSource,
  extent: extent  // Also set extent on the layer itself
});

const map = new Map({
  layers: [zoomifyLayer, vectorLayer2],
  target: 'map',
  view: new View({
    projection: projection,
    center: getCenter(extent),
    zoom: 2,
    maxZoom: 11,
  }),
});

zoomifyLayer.setOpacity(1);