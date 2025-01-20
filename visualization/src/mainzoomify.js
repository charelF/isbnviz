import Map from 'ol/Map.js';
import TileLayer from 'ol/layer/Tile.js';
import View from 'ol/View.js';
import Zoomify from 'ol/source/Zoomify.js';
import Projection from 'ol/proj/Projection.js';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import GeoJSON from 'ol/format/GeoJSON';
import { getCenter } from 'ol/extent.js';
import {FullScreen, defaults as defaultControls} from 'ol/control.js';


const N = 2**16
const tilesize = 4096

// Define the extent to match your GeoJSON coordinates
const extent = [0, 0, N, N/2];

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
const ratio = 2;
const source = new Zoomify({
  url: 'zoomify/gbooks_top_q100_N4294967296_t4096_png/{TileGroup}/{z}-{x}-{y}.png',
  size: [N, N/2],
  crossOrigin: 'anonymous',
  projection: projection,
  interpolate: false,
  zDirection: 0,
  tilePixelRatio: ratio,
  tileSize: tilesize / ratio,
  extent: extent  // Set the same extent as the projection
});

const zoomifyLayer = new TileLayer({
  source: source,
  extent: extent  // Also set extent on the layer itself
});

const map = new Map({
  layers: [zoomifyLayer, vectorLayer2],
  controls: defaultControls().extend([new FullScreen()]),
  target: 'map',
  view: new View({
    projection: projection,
    center: getCenter(extent),
    zoom: 1,
    maxZoom: 12,
    pinchRotate: false,
    enableRotation: false,
  }),
});

zoomifyLayer.setOpacity(1);