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
import {
    Circle as CircleStyle,
    Fill,
    Stroke,
    Style,
    Text,
  } from 'ol/style.js';
import Feature from 'ol/Feature';

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

vectorLayerAll.setOpacity(0.5)



// Setup Zoomify source with adjusted positioning
const isMobile = true///Mobi|Android/i.test(navigator.userAgent);
const ratio = isMobile ? 1 : 2;
const zdir = isMobile ? -1 : 1;
// TODO: make the above settings

console.log(isMobile, ratio, zdir)

const source = new Zoomify({
  url: 'zoomify/combined.png/{TileGroup}/{z}-{x}-{y}.png',
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


function polygonStyleFunction(feature, resolution) {
    const geometry = feature.getGeometry();
    const centroid = geometry.getExtent();

    return new Style({
      stroke: new Stroke({
        color: feature.get('C7'),
        width: 1,
      }),
      fill: new Fill({
        color: feature.get('C3'),
      }),
    //   text: new Text({
    //     text: feature.get('NAME'),
    //     font: '12px sans-serif',  // You can modify the font and style as needed
    //     fill: new Fill({
    //       color: '#000000', // Text color
    //     }),
    //     stroke: new Stroke({
    //       color: '#ffffff', // Stroke color around text (for better visibility)
    //       width: 3,
    //     }),
    //     textAlign: 'center',  // Optional: Align text to the center
    //     textBaseline: 'middle', // Optional: Align text vertically to the center
    //     offsetX: 0, // Optional: Move text horizontally if needed
    //     offsetY: 0, // Optional: Move text vertically if needed
    //     position: centroid, // Position the text at the centroid
    //   }),
    });
  }

const vectorLayerHighlight = new VectorLayer({
    source: new VectorSource(),
    map: map,
    style: polygonStyleFunction,
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
    var y = - Math.round(coordinates[1]) + 32768
    var i = posToNum(y, x)
    var isbn = getISBN(i)
    // console.log(`x=${x} y=${y} i=${i}`)
    info.innerText = `x=${x} y=${y} i=${i} isbn=${isbn} ${feature?.get('NAME') ?? ''}`;
  
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
  
  
  function posToNum2(x, y) {
    const dimensions = 16;
    let h = 0;
    let n = Math.pow(2, dimensions);
    let n2, t;
    for (let i = dimensions - 1; i >= 0; i--) {
        n2 = n >> 1;
        let bits;
        if (x < n2 && y < n2) {
            t = x;
            x = y;
            y = t;
            bits = 0;
        } else if (x < n2 && y >= n2) {
            y -= n2;
            bits = 1;
        } else if (x >= n2 && y >= n2) {
            x -= n2;
            y -= n2;
            bits = 2;
        } else {
            t = y;
            y = (n2 - 1) - x + n2;
            x = (n2 - 1) - t;
            bits = 3;
        }
        h = (h << 2) | bits;
        n = n2;
    }

    return h >>> 0; // Convert to unsigned 32-bit integer
}

function posToNum(x, y) {
    const dimensions = 16
    let h = 0;

    let n = 2 ** dimensions;
    let n2, t;

    for (let i = dimensions - 1; i >= 0; i--) {
        n2 = n / 2;

        let bits;
        if (x < n2 && y < n2) {
            // Case 0
            t = x;
            x = y;
            y = t;
            bits = 0;
        } else if (x < n2 && y >= n2) {
            // Case 1
            y -= n2;
            bits = 1;
        } else if (x >= n2 && y >= n2) {
            // Case 2
            x -= n2;
            y -= n2;
            bits = 2;
        } else {
            // Case 3
            t = y;
            y = (n2 - 1) - x + n2;
            x = (n2 - 1) - t;
            bits = 3;
        }

        h = (h << 2) | bits; // Shift h left by 2 bits and add the bits
        n = n2;
    }

    return h;
}


  
  function getISBN(index) {
      const newIndex = index + 978_000_000_000;
      return newIndex.toString();  // Convert the result to a string
  }

//   vectorLayerHighlight.setOpacity(0)
//   vectorLayerAll.setOpacity(0)