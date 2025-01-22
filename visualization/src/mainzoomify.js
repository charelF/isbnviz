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

const vectorLayerAll = new VectorLayer({
    source: new VectorSource({
      url: 'countries.json',
      format: new GeoJSON({
        dataProjection: projection,    
        featureProjection: projection
      }),
      }),
    style: {
    'stroke-color': ['string', ['get', 'C4'], '#ff4488'],
    'stroke-width': 1,
      'fill-color': ['string', ['get', 'C1'], '#ff4488'],
    },
  });

// Setup Zoomify source with adjusted positioning
const isMobile = true///Mobi|Android/i.test(navigator.userAgent);
const ratio = isMobile ? 1 : 2;
const zdir = isMobile ? -1 : 1;
// TODO: make the above settings

console.log(isMobile, ratio, zdir)

const source = new Zoomify({
  url: 'zoomify/gbooks_top_q100_N4294967296_t4096_png_i/{TileGroup}/{z}-{x}-{y}.png',
  size: [N, N/2],
  crossOrigin: 'anonymous',
  projection: projection,
  interpolate: false,
  zDirection: zdir,
  tilePixelRatio: ratio,
  tileSize: tilesize / ratio,
  extent: extent  // Set the same extent as the projection
});

const zoomifyLayer = new TileLayer({
  source: source,
  extent: extent  // Also set extent on the layer itself
});

const map = new Map({
  layers: [zoomifyLayer, vectorLayerAll],
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


const vectorLayerHighlight = new VectorLayer({
    source: new VectorSource(),
    map: map,
    style: {
        'stroke-color': ['string', ['get', 'C7'], '#ff4488'],
        'stroke-width': 2,
        'fill-color': ['string', ['get', 'C3'], '#ff4488'],
    },
  });

  let highlight;
  const displayFeatureInfo = function (event) {
      const pixel = event.pixel
      const coordinates = event.coordinate;
      const feature = map.forEachFeatureAtPixel(pixel, function (feature) {
          return feature;
      });
    // Set the tooltip position and content
    const offset0 = 0; // Distance between the mouse and the tooltip
    const offset1 = 0; // Distance between the mouse and the tooltip
    info.style.left = pixel[0] - info.offsetWidth - offset0 + 'px'; // Offset to the left of the pointer
    info.style.top = pixel[1] - offset1 + 'px'; // Vertically aligned with the pointer
    info.style.visibility = 'visible';
    var x = Math.round(coordinates[0])
    // var y = 4096 - Math.round(coordinates[1])
    var y = Math.round(coordinates[1])
    var i = getHilbertCurveIndex(x,y, 12)
    var isbn = getISBN(i)
    info.innerText = `${x}, ${y} ${i} ${isbn} ${feature?.get('NAME') ?? ''}`;
  
    if (feature !== highlight) {
      if (highlight) {
          vectorLayerHighlight.getSource().removeFeature(highlight);
      }
      if (feature) {
          vectorLayerHighlight.getSource().addFeature(feature);
      }
      highlight = feature;
    }
  };
  
  map.on('pointermove', function (event) {
    if (event.dragging) {
      info.style.visibility = 'hidden';  // for mobile
      return;
    }
    displayFeatureInfo(event);
  });
  
  map.on('click', function (event) {
    displayFeatureInfo(event);
  });
  
  
  // Add a tooltip element to the DOM
  const info = document.createElement('div');
  info.id = 'info';
  document.body.appendChild(info);
  
  
  function getHilbertCurveIndex(x, y, order) {
      let index = 0;
      let n = 1 << order;  // 2^order
      while (n > 1) {
          const quadrantSize = n / 2;
          let quadrant = 0;
  
          // Determine the quadrant in which (x, y) lies
          if (x >= quadrantSize) {
              x -= quadrantSize;
              quadrant |= 1; // 1 means right half
          }
          if (y >= quadrantSize) {
              y -= quadrantSize;
              quadrant |= 2; // 2 means bottom half
          }
  
          // Update the index by shifting and adding the quadrant
          index = (index << 2) | quadrant;
  
          // Reduce the problem to the next smaller grid
          n = quadrantSize;
      }
  
      return index;
  }
  
  function getISBN(index) {
      const newIndex = index + 978000000000;
      return newIndex.toString();  // Convert the result to a string
  }