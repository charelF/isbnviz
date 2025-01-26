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
    Circle as CircleStyle,
    Fill,
    Stroke,
    Style,
    Text,
} from 'ol/style.js';
import Feature from 'ol/Feature';
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

// Setup Zoomify source with adjusted positioning
const isMobile = true///Mobi|Android/i.test(navigator.userAgent);
const ratio = isMobile ? 1 : 2;
const zdir = isMobile ? -1 : 1;
// TODO: make the above settings

console.log(isMobile, ratio, zdir)

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

function polygonStyleFunction(feature, resolution) {
    const geometry = feature.getGeometry();
    const centroid = geometry.getExtent();

    return new Style({
        stroke: new Stroke({
            color: '#000000',//feature.get('C7'),
            width: 2,
        }),
        fill: new Fill({
            color: '#00000010'//feature.get('C3'),
        }),
    });
}

const vectorLayerHighlight = new VectorLayer({
    source: new VectorSource(),
    map: map,
    style: polygonStyleFunction,
});

let highlight;
const displayFeatureInfo = function (event) {
    console.log(event)
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
    var x = Math.round(event.coordinate[0])
    var y = - Math.round(event.coordinate[1]) + 32768
    var i = posToNum(y, x)
    var isbn = getISBN(i)
    if (isbn) {
        window.open(`https://annas-archive.org/search?q=${isbn}`, '_blank');
    }
});

const info = document.createElement('div');
info.id = 'info';
document.body.appendChild(info);

function getISBN(index) {
    const newIndex = index + 978_000_000_000;
    return newIndex.toString();  // Convert the result to a string
}

//   vectorLayerHighlight.setOpacity(0)
//   vectorLayerAll.setOpacity(0)





// Create draggable settings panel
const settingsPanel = document.createElement('div');
settingsPanel.id = 'settings-panel';
settingsPanel.style.cssText = `
    position: absolute;
    top: 20px;
    left: 20px;
    background: rgba(255, 255, 255, 0.4);
    backdrop-filter: blur(10px);
    border-radius: 8px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    z-index: 1000;
    min-width: min(80vw, 300px);
    overflow: hidden;
    font-family: monospace;
`;

// Add draggable title bar
const titleBar = document.createElement('div');
titleBar.style.cssText = `
    width: 100%;
    height: 40px;
    background: rgba(255, 255, 255, 0.6);
    cursor: move;
    display: flex;
    align-items: center;
    padding: 0 15px;
    border-top-left-radius: 8px;
    border-top-right-radius: 8px;
    border-bottom: 1px solid rgba(0, 0, 0, 0.1);
    touch-action: none;
`;

const title = document.createElement('h3');
title.textContent = 'Map Settings';
title.style.margin = '0';
title.style.fontSize = '16px';
title.style.userSelect = 'none';
titleBar.appendChild(title);

// Content container
const contentContainer = document.createElement('div');
contentContainer.style.padding = '20px';

const opacityLabel = document.createElement('label');
opacityLabel.textContent = 'Layer Opacity:';
opacityLabel.style.fontSize = '14px';
const opacitySlider = document.createElement('input');
opacitySlider.type = 'range';
opacitySlider.min = '0';
opacitySlider.max = '100';
opacitySlider.value = '100';
opacitySlider.style.width = '100%';
opacitySlider.style.margin = '10px 0';
opacitySlider.style.height = '24px';

const toggleLabel = document.createElement('label');
toggleLabel.textContent = 'Show Labels:';
toggleLabel.style.fontSize = '14px';
const toggleSwitch = document.createElement('input');
toggleSwitch.type = 'checkbox';
toggleSwitch.style.transform = 'scale(1.5)';
toggleSwitch.style.margin = '0 0 0 10px';

contentContainer.appendChild(opacityLabel);
contentContainer.appendChild(opacitySlider);
contentContainer.appendChild(document.createElement('br'));
contentContainer.appendChild(document.createElement('br'));
contentContainer.appendChild(toggleLabel);
contentContainer.appendChild(toggleSwitch);

settingsPanel.appendChild(titleBar);
settingsPanel.appendChild(contentContainer);
document.body.appendChild(settingsPanel);

// Make the panel draggable
let isDragging = false;
let currentX;
let currentY;
let initialX;
let initialY;
let xOffset = 0;
let yOffset = 0;

titleBar.addEventListener('mousedown', dragStart);
titleBar.addEventListener('touchstart', dragStart);
document.addEventListener('mousemove', drag);
document.addEventListener('touchmove', drag);
document.addEventListener('mouseup', dragEnd);
document.addEventListener('touchend', dragEnd);

function dragStart(e) {
    if (e.type === 'touchstart') {
        initialX = e.touches[0].clientX - xOffset;
        initialY = e.touches[0].clientY - yOffset;
    } else {
        initialX = e.clientX - xOffset;
        initialY = e.clientY - yOffset;
    }

    if (e.target === titleBar || e.target === title) {
        isDragging = true;
    }
}

function drag(e) {
    if (isDragging) {
        e.preventDefault();
        
        if (e.type === 'touchmove') {
            currentX = e.touches[0].clientX - initialX;
            currentY = e.touches[0].clientY - initialY;
        } else {
            currentX = e.clientX - initialX;
            currentY = e.clientY - initialY;
        }

        xOffset = currentX;
        yOffset = currentY;

        setTranslate(currentX, currentY, settingsPanel);
    }
}

function dragEnd(e) {
    initialX = currentX;
    initialY = currentY;
    isDragging = false;
}

function setTranslate(xPos, yPos, el) {
    // Keep panel within viewport bounds
    const rect = el.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    xPos = Math.min(Math.max(xPos, -rect.left), viewportWidth - rect.width);
    yPos = Math.min(Math.max(yPos, -rect.top), viewportHeight - rect.height);
    
    el.style.transform = `translate(${xPos}px, ${yPos}px)`;
}