import Map from 'ol/Map.js';
import TileLayer from 'ol/layer/Tile.js';
import View from 'ol/View.js';
import Zoomify from 'ol/source/Zoomify.js';
import Projection from 'ol/proj/Projection.js';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import GeoJSON from 'ol/format/GeoJSON';
import { getCenter } from 'ol/extent.js';
import { FullScreen, defaults as defaultControls } from 'ol/control.js';
import {
    Fill,
    Stroke,
    Style,
} from 'ol/style.js';
import { posToNum } from './util';

const N = 2 ** 16
const tilesize = 4096

const extent = [0, 0, N, N / 2];
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
        'stroke-color': ['string', ['get', 'C-4'], '#000000'],
        'stroke-width': 1,
        'fill-color': ['string', ['get', 'C-1'], '#00000000'],
    },
});
vectorLayerAll.setOpacity(0.5)

const ratio = 1
const zdir = -1
const source = new Zoomify({
    url: 'zoomify/combined.png/{TileGroup}/{z}-{x}-{y}.png',
    size: [N, N / 2],
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
    style: new Style({
        stroke: new Stroke({
            color: '#000000',//feature.get('C7'),
            width: 2,
        }),
        fill: new Fill({
            color: '#00000010'//feature.get('C3'),
        }),
    }),
});

let highlight;
const displayFeatureInfo = function (event) {
    const pixel = event.pixel
    const coordinates = event.coordinate;
    const feature = map.forEachFeatureAtPixel(pixel, function (feature) {
        return feature;
    });
    var x = Math.round(coordinates[0])
    var y = - Math.round(coordinates[1]) + 32768
    var i = posToNum(y, x)
    var isbn = getISBN(i)
    const infoDisplay = document.getElementById('info-display');
    infoDisplay.innerText = `x=${x.toString().padStart(5, '0')} y=${y.toString().padStart(5, '0')} i=${i} isbn=${isbn} \n ${feature?.get('NAME') ?? '-'}`;


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
    var x = Math.round(event.coordinate[0])
    var y = - Math.round(event.coordinate[1]) + 32768
    var i = posToNum(y, x)
    var isbn = getISBN(i)
    if (isbn) {
        window.open(`https://annas-archive.org/search?q=${isbn}`, '_blank');
    }
});

function getISBN(index) {
    const newIndex = index + 978_000_000_000;
    return newIndex.toString();  // Convert the result to a string
}