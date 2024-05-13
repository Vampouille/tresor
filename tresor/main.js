import Geolocation from 'ol/Geolocation.js';
import Feature from 'ol/Feature.js';
import {Circle as CircleStyle, Fill, Stroke, Style} from 'ol/style.js';
import Map from 'ol/Map.js';
import {OSM, Vector as VectorSource} from 'ol/source.js';
import Static from 'ol/source/ImageStatic.js';
import View from 'ol/View.js';
import proj4 from 'proj4';
import {Image as ImageLayer, Tile as TileLayer, Vector as VectorLayer} from 'ol/layer.js';
import {getCenter} from 'ol/extent.js';
import {register} from 'ol/proj/proj4.js';
import {transform} from 'ol/proj.js';
import Point from 'ol/geom/Point.js';

proj4.defs(
  'EPSG:2154',
  '+proj=lcc +lat_0=46.5 +lon_0=3 +lat_1=49 +lat_2=44 +x_0=700000 +y_0=6600000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs',
);
register(proj4);

const tresorExtent = [917637.5170, 6520368.8593, 918293.7471, 6521299.2999];

const source = new Static({
  //url: 'http://192.168.46.224:5174/test5.png',
  url: 'http://localhost:5174/test5.png',
  crossOrigin: '',
  projection: 'EPSG:2154',
  imageExtent: tresorExtent,
  interpolate: true,
});

const imageLayer = new ImageLayer({
  opacity: 0.4,
  source: source,
});

const view = new View({
    center: transform(getCenter(tresorExtent), 'EPSG:2154', 'EPSG:3857'),
    zoom: 15,
  });

const map = new Map({
  layers: [
    new TileLayer({
      source: new OSM(),
    }),
    imageLayer,
  ],
  target: 'map',
  view: view,
});

const geolocation = new Geolocation({
  trackingOptions: {
    enableHighAccuracy: true,
  },
  projection: view.getProjection(),
});

function el(id) {
  return document.getElementById(id);
}

const accuracyFeature = new Feature();
geolocation.on('change:accuracyGeometry', function () {
  accuracyFeature.setGeometry(geolocation.getAccuracyGeometry());
});

const positionFeature = new Feature();
positionFeature.setStyle(
  new Style({
    image: new CircleStyle({
      radius: 6,
      fill: new Fill({
        color: '#3399CC',
      }),
      stroke: new Stroke({
        color: '#fff',
        width: 2,
      }),
    }),
  }),
);

geolocation.on('change:position', function () {
  const coordinates = geolocation.getPosition();
  positionFeature.setGeometry(coordinates ? new Point(coordinates) : null);
});

new VectorLayer({
  map: map,
  source: new VectorSource({
    features: [accuracyFeature, positionFeature],
  }),
});
geolocation.setTracking(true);
