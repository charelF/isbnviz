import Map from 'ol/Map.js';
import TileLayer from 'ol/layer/Tile.js';
import View from 'ol/View.js';
import { Zoomify } from 'ol/source.js';

import Projection from 'ol/proj/Projection.js';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import GeoJSON from 'ol/format/GeoJSON';


const extent = [0, 0, 4096, 4096];
const projection = new Projection({
    code: 'isbn-image',
    units: 'pixels',
    extent: extent,
});

const vectorSource2 = new VectorSource({
  url: 'geo.json',
  format: new GeoJSON({
    dataProjection: projection,    // The projection of your GeoJSON data
    featureProjection: projection  // The projection you want to use in the map
  })
});

const vectorLayer2 = new VectorLayer({
  source: vectorSource2
});


const dzi = (function () {
    function loadUrl(url, opt_options) {
        const options = opt_options || {};
        const crossOrigin = options.crossOrigin === undefined ? 'anonymous' : options.crossOrigin;

        const layer = new TileLayer();

        const last = url.lastIndexOf('.');
        const path = url.slice(0, last);

        const xhr = new XMLHttpRequest();
        xhr.open('GET', url);
        xhr.onload = function () {
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(xhr.responseText, 'text/xml');

            const elements = xmlDoc.getElementsByTagName('Image');
            const tileSize = Number(elements[0].getAttribute('TileSize'));
            const format = elements[0].getAttribute('Format');
            const width = Number(elements[0].getElementsByTagName('Size')[0].getAttribute('Width'));
            const height = Number(elements[0].getElementsByTagName('Size')[0].getAttribute('Height'));
            const sourceUrl = path + '_files/{z}/{x}_{y}.' + format;

            const source = new Zoomify({
                attributions: options.attributions,
                url: sourceUrl,
                size: [width, height],
                tileSize: tileSize,
                crossOrigin: crossOrigin,
            });

            const offset = Math.ceil(Math.log(tileSize) / Math.LN2);

            source.setTileUrlFunction((tileCoord) => {
                return sourceUrl
                    .replace('{z}', tileCoord[0] + offset)
                    .replace('{x}', tileCoord[1])
                    .replace('{y}', tileCoord[2]);
            });

            layer.setExtent([0, -height, width, 0]);
            layer.setSource(source);
        };
        xhr.send();
        return layer;
    }

    return {
        loadUrl: loadUrl,
    };
})();

const map = new Map({
    target: 'map',
    logo: false,
});

const layer = dzi.loadUrl(
    'https://openseadragon.github.io/example-images/duomo/duomo.dzi',
    {
        attributions: 'Image &copy 2012, <a href="https://www.flickr.com/photos/projectese/" target="_blank">Dario Morelli</a>',
    }
);

layer.on('change:source', function (evt) {
    map.setView(
        new View({
            resolutions: layer.getSource().getTileGrid().getResolutions(),
            extent: layer.getExtent(),
            constrainOnlyCenter: true,
        })
    );
    map.getView().fit(layer.getExtent(), { size: map.getSize() });
});

map.addLayer(layer);
map.addLayer(vectorLayer2);

vectorLayer2.setOpacity(0.5)
layer.setOpacity(0.5)
