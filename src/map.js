let map;
let infowindow;

const getHelipuertosTemplate = info => `<table>
  <tr>
    <td>${info.name}</td>
  </tr>
  <tr>
    <td>${info.zoneType}</td>
  </tr>
  </table>`;

const getAerodromosTemplate = info => `<table>
  <tr>
    <td>${info.name}</td><td>(${info.code_dgac})</td>
  </tr>
  <tr>
    <td>${info.zoneType}</td>
  </tr>
  </table>`;

const getZonasTemplate = info => `<table>
  <tr>
    <td>${info.id}</td>
    <td>${info.name}</td>
  </tr>
  <tr>
    <td>Zona ${info.zoneType}</td>
  </tr>
  <tr>
    <td>${info.lim_inf}</td>
    <td>${info.lim_sup}</td>
  </tr>
  </table>`;

const mapStyle = [
  { elementType: 'geometry', stylers: [{ color: '#ebe3cd' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#523735' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#f5f1e6' }] },
  {
    featureType: 'administrative',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#c9b2a6' }]
  },
  {
    featureType: 'administrative.land_parcel',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#dcd2be' }]
  },
  {
    featureType: 'administrative.land_parcel',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#ae9e90' }]
  },
  {
    featureType: 'landscape.natural',
    elementType: 'geometry',
    stylers: [{ color: '#dfd2ae' }]
  },
  {
    featureType: 'poi',
    elementType: 'geometry',
    stylers: [{ color: '#dfd2ae' }]
  },
  {
    featureType: 'poi',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#93817c' }]
  },
  {
    featureType: 'poi.park',
    elementType: 'geometry.fill',
    stylers: [{ color: '#a5b076' }]
  },
  {
    featureType: 'poi.park',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#447530' }]
  },
  {
    featureType: 'road',
    elementType: 'geometry',
    stylers: [{ color: '#f5f1e6' }]
  },
  {
    featureType: 'road.arterial',
    elementType: 'geometry',
    stylers: [{ color: '#fdfcf8' }]
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry',
    stylers: [{ color: '#f8c967' }]
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#e9bc62' }]
  },
  {
    featureType: 'road.highway.controlled_access',
    elementType: 'geometry',
    stylers: [{ color: '#e98d58' }]
  },
  {
    featureType: 'road.highway.controlled_access',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#db8555' }]
  },
  {
    featureType: 'road.local',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#806b63' }]
  },
  {
    featureType: 'transit.line',
    elementType: 'geometry',
    stylers: [{ color: '#dfd2ae' }]
  },
  {
    featureType: 'transit.line',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#8f7d77' }]
  },
  {
    featureType: 'transit.line',
    elementType: 'labels.text.stroke',
    stylers: [{ color: '#ebe3cd' }]
  },
  {
    featureType: 'transit.station',
    elementType: 'geometry',
    stylers: [{ color: '#dfd2ae' }]
  },
  {
    featureType: 'water',
    elementType: 'geometry.fill',
    stylers: [{ color: '#b9d3c2' }]
  },
  {
    featureType: 'water',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#92998d' }]
  }
];

const mapOptions = {
  center: { lat: 23.6345005, lng: -102.5527878 },
  zoom: 5,
  zoomControl: true,
  minZoom: 4,
  mapTypeControl: false,
  scaleControl: true,
  streetViewControl: false,
  rotateControl: false,
  fullscreenControl: true,
  styles: mapStyle
};

const typeColors = {
  'prohibido': 'red',
  'restringido': 'purple',
  'peligroso': 'yellow',
  'aerodromo': 'cornflowerblue',
  'helipuerto': 'limegreen'
};

function initMap() {
  map = new google.maps.Map(document.getElementById('map'), mapOptions);
  infowindow = new google.maps.InfoWindow();

  [
    'dist/nfz-data.json',
    'dist/aerodromos.json',
    'dist/helipuertos.json'
  ].forEach(dataSource => {
    map.data.loadGeoJson(dataSource, null, () => addEvents(map.data));
  });

  map.data.setStyle((feature) => {
    const geo = feature.getGeometry()
    const type = geo.getType();
    const zoneType = feature.getProperty('zoneType');
    const fillColor = typeColors[zoneType];

    if (type === 'Point') {
      const radius = parseInt(feature.getProperty('radius'));

      feature.circle = new google.maps.Circle({
        map: map,
        center: geo.get(),
        radius,
        fillColor,
        strokeColor: fillColor,
        strokeWeight: 1
      });

      feature.circle.addListener('click', () => clickHandler.call(feature.circle, feature.l));

      return { visible: false };
    }

    return {
      fillColor,
      strokeColor: fillColor,
      strokeWeight: 1
    }
  });

  function addEvents(a) {
    a.addListener('click', clickHandler);
  }
}

function clickHandler(event) {
  const position = event.feature ? event.latLng : this.center;
  const info = extractInfo(event);
  const content = formatContent(info);
  
  infowindow.setPosition(position);
  infowindow.setContent(content);
  infowindow.open(map);
}

function extractInfo(obj) {
  const info = {};

  obj.hasOwnProperty('feature') ?
    obj.feature.forEachProperty((val, prop) => info[prop] = val) :
    Object.assign(info, obj);
  
  return info;
}

function formatContent(info) {
  console.log(info)
  let template;

  switch (info.zoneType) {
    case 'prohibido':
    case 'restringido':
    case 'peligroso':
      template = getZonasTemplate(info);
      break;
    
    case 'aerodromo':
      template = getAerodromosTemplate(info);
      break;
      
    case 'helipuerto':
      template = getHelipuertosTemplate(info);
      break;
  }

  return template;
}
