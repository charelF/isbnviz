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
    },
  });

vectorLayerAll.setOpacity(0.2)
imagelayer.setOpacity(0.4)

let highlight;
const displayFeatureInfo = function (pixel) {
  const feature = map.forEachFeatureAtPixel(pixel, function (feature) {
    return feature;
  });

//   const info = document.getElementById('info');
//   if (feature) {
//     info.innerHTML = feature.get('ECO_NAME') || '&nbsp;';
//   } else {
//     info.innerHTML = '&nbsp;';
//   }

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
  displayFeatureInfo(event.pixel);
});

map.on('click', function (event) {
  displayFeatureInfo(event.pixel);
});







// // Add a tooltip element to the DOM
// const info = document.createElement('div');
// info.id = 'info';
// document.body.appendChild(info);

// // Create a vector layer to highlight the base-2 blocks
// const vectorSource = new VectorSource();
// const vectorLayer = new VectorLayer({
//     source: vectorSource,
//     style: new Style({
//         stroke: new Stroke({
//             color: 'rgba(255, 0, 0, 0.8)',
//             width: 2,
//         }),
//     }),
// });
// map.addLayer(vectorLayer);

// // Calculate block size based on the zoom level
// function calculateBlockSize(zoom) {
//     const maxZoom = 10; // Maximum zoom level
//     const maxBlockSize = 4096; // Maximum block size (whole image)
    
//     // Block size decreases by powers of 2 as zoom level increases
//     return maxBlockSize / Math.pow(2, zoom+1);
// }

// // Highlight the block dynamically based on the zoom level
// function highlightBase2Block(coordinate) {
//     const zoom = Math.round(map.getView().getZoom()); // Ensure integer zoom levels
//     const blockSize = calculateBlockSize(zoom);

//     // Snap the coordinates to the nearest base-2 grid
//     const x = Math.floor(coordinate[0] / blockSize) * blockSize;
//     const y = Math.floor(coordinate[1] / blockSize) * blockSize;

//     // Define the block as a polygon
//     const blockPolygon = new Polygon([[
//         [x, y],
//         [x + blockSize, y],
//         [x + blockSize, y + blockSize],
//         [x, y + blockSize],
//         [x, y],
//     ]]);

//     // Clear previous features and add the new one
//     vectorSource.clear();
//     vectorSource.addFeature(new Feature(blockPolygon));
// }

// function getHilbertCurveIndex(x, y, order) {
//     let index = 0;
//     let n = 1 << order;  // 2^order
//     while (n > 1) {
//         const quadrantSize = n / 2;
//         let quadrant = 0;

//         // Determine the quadrant in which (x, y) lies
//         if (x >= quadrantSize) {
//             x -= quadrantSize;
//             quadrant |= 1; // 1 means right half
//         }
//         if (y >= quadrantSize) {
//             y -= quadrantSize;
//             quadrant |= 2; // 2 means bottom half
//         }

//         // Update the index by shifting and adding the quadrant
//         index = (index << 2) | quadrant;

//         // Reduce the problem to the next smaller grid
//         n = quadrantSize;
//     }

//     return index;
// }

// function getISBN(index) {
//     const newIndex = index + 978000000000;
//     return newIndex.toString();  // Convert the result to a string
// }


// // Update the tooltip with the coordinates and highlight the block
// map.on('pointermove', function (evt) {
//     if (evt.dragging) {
//         info.style.visibility = 'hidden';
//         vectorSource.clear();
//         return;
//     }

//     // Get the coordinates from the event
//     const coordinates = evt.coordinate;
//     const pixel = evt.pixel;

//     // Highlight the base-2 block
//     highlightBase2Block(coordinates);

//     // Set the tooltip position and content
//     const offset0 = -100; // Distance between the mouse and the tooltip
//     const offset1 = -80; // Distance between the mouse and the tooltip
//     info.style.left = pixel[0] - info.offsetWidth - offset0 + 'px'; // Offset to the left of the pointer
//     info.style.top = pixel[1] - offset1 + 'px'; // Vertically aligned with the pointer
//     info.style.visibility = 'visible';
//     var x = Math.round(coordinates[0])
//     var y = 4096 - Math.round(coordinates[1])
//     var i = getHilbertCurveIndex(x,y, 12)
//     var isbn = getISBN(i)
//     info.innerText = `${x}, ${y} ${i} ${isbn}`;
// });





// // Hide the tooltip and clear the block highlight when the mouse leaves the map
// map.getTargetElement().addEventListener('pointerleave', function () {
//     info.style.visibility = 'hidden';
//     vectorSource.clear();
// });

// const geojsonUrl = '/geo.js';
// const vectorSource2 = new VectorSource({
//     url: geojsonUrl,
//     format: new GeoJSON(),
//   })
// const vectorLayer2 = new VectorLayer({
//     source: vectorSource2,
//     style: new Style({
//         stroke: new Stroke({
//             color: 'rgba(255, 0, 0, 0.8)',
//             width: 2,
//         }),
//     }),
// });

// var vectorLayer3 = new VectorLayer({
//     source: new VectorSource({
//         format: new GeoJSON(),
//         url: 'https://gist.githubusercontent.com/neogis-de/154f4bd155f77e0f3689/raw/5a1642fac4afff463c3ff08beaad55892fe9acd4/geojson.js'
//     }),
//     style: new Style({
//         image: new Circle( ({
//             radius: 2000,
//             fill: new Fill({
//                 color: '#ff1100'
//             })
//         }))
//     })
// });

// vectorSource2.on('featuresloadend', () => {
//     console.log('GeoJSON loaded successfully!');
// });
// vectorSource2.on('featuresloaderror', (error) => {
//     console.error('Error loading GeoJSON!', error);
//     console.log(vectorSource2)
// });

// map.addLayer(vectorLayer2);
// map.addLayer(vectorLayer3);