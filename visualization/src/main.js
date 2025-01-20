import ImageLayer from 'ol/layer/Image.js';
import Map from 'ol/Map.js';
import Projection from 'ol/proj/Projection.js';
import Static from 'ol/source/ImageStatic.js';
import View from 'ol/View.js';
import { getCenter } from 'ol/extent.js';
import { Tile as TileLayer } from 'ol/layer';
import { OSM } from 'ol/source';
// import { Feature } from 'ol';
import Feature from 'ol/Feature.js';

import { Polygon, Circle } from 'ol/geom';
import { Style, Stroke, Fill } from 'ol/style';
import 'ol/ol.css';
import GeoJSON from 'ol/format/GeoJSON';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';


// Define the extent of the image
const extent = [0, 0, 4096, 4096];
const projection = new Projection({
    code: 'isbn-image',
    units: 'pixels',
    extent: extent,
});

const vectorLayerAll = new VectorLayer({
  source: new VectorSource({
    url: 'geo.json',
    format: new GeoJSON({
      dataProjection: projection,    
      featureProjection: projection
    }),
    }),
  style: {
    'fill-color': ['string', ['get', 'COLOR'], '#ff4488'],
  },
});

const imagelayer = new ImageLayer({
    source: new Static({
        url: '/image.png',
        projection: projection,
        imageExtent: extent,
        interpolate: false
    }),
})

const map = new Map({
    layers: [
        imagelayer, 
        vectorLayerAll,
    ],
    target: 'map',
    view: new View({
        projection: projection,
        center: getCenter(extent),
        zoom: 2,
        maxZoom: 11,
    }),
});

const vectorLayerHighlight = new VectorLayer({
    source: new VectorSource(),
    map: map,
    style: {
        'stroke-color': ['string', ['get', 'COLOR'], '#ff4488'],
        'stroke-width': 2,
        'fill-color': ['string', ['get', 'COLOR2'], '#ff4488'],
    },
  });

vectorLayerAll.setOpacity(0.2)
// vectorLayerHighlight.setOpacity(0.2)
imagelayer.setOpacity(0.4)

let highlight;
const displayFeatureInfo = function (event) {
    const pixel = event.pixel
    const coordinates = event.coordinate;
    const feature = map.forEachFeatureAtPixel(pixel, function (feature) {
        return feature;
    });

  // Get the coordinates from the event
  

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




