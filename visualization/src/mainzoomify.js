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

// Use the same projection setup that works with the static image
const projection = new Projection({
  code: 'isbn-image',
  units: 'pixels',
  extent: extent,
});

// Create vector layer with exact same setup as working example
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

// Setup Zoomify source
const retinaPixelRatio = 2;
const retinaSource = new Zoomify({
  url: 'https://ol-zoomify.surge.sh/zoomify/',
  size: [4096, 4096], // Match the extent size
  crossOrigin: 'anonymous',
  projection: projection,  // Use same projection
  zDirection: -1,
  tilePixelRatio: retinaPixelRatio,
  tileSize: 256 / retinaPixelRatio,
});

// Create Zoomify layer
const zoomifyLayer = new TileLayer({
  source: retinaSource,
});

// Create map with same view setup as working example
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

zoomifyLayer.setOpacity(0.5);