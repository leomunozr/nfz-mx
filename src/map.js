let map;
let infowindow;

function initMap() {
  map = new google.maps.Map(document.getElementById('map'), {
    center: { lat: 21.880591, lng: -102.296002 },
    zoom: 5,
    zoomControl: true,
    minZoom: 4,
    mapTypeControl: false,
    scaleControl: true,
    streetViewControl: false,
    rotateControl: false,
    fullscreenControl: true,
    styles: [
      {elementType: 'geometry', stylers: [{color: '#ebe3cd'}]},
      {elementType: 'labels.text.fill', stylers: [{color: '#523735'}]},
      {elementType: 'labels.text.stroke', stylers: [{color: '#f5f1e6'}]},
      {
        featureType: 'administrative',
        elementType: 'geometry.stroke',
        stylers: [{color: '#c9b2a6'}]
      },
      {
        featureType: 'administrative.land_parcel',
        elementType: 'geometry.stroke',
        stylers: [{color: '#dcd2be'}]
      },
      {
        featureType: 'administrative.land_parcel',
        elementType: 'labels.text.fill',
        stylers: [{color: '#ae9e90'}]
      },
      {
        featureType: 'landscape.natural',
        elementType: 'geometry',
        stylers: [{color: '#dfd2ae'}]
      },
      {
        featureType: 'poi',
        elementType: 'geometry',
        stylers: [{color: '#dfd2ae'}]
      },
      {
        featureType: 'poi',
        elementType: 'labels.text.fill',
        stylers: [{color: '#93817c'}]
      },
      {
        featureType: 'poi.park',
        elementType: 'geometry.fill',
        stylers: [{color: '#a5b076'}]
      },
      {
        featureType: 'poi.park',
        elementType: 'labels.text.fill',
        stylers: [{color: '#447530'}]
      },
      {
        featureType: 'road',
        elementType: 'geometry',
        stylers: [{color: '#f5f1e6'}]
      },
      {
        featureType: 'road.arterial',
        elementType: 'geometry',
        stylers: [{color: '#fdfcf8'}]
      },
      {
        featureType: 'road.highway',
        elementType: 'geometry',
        stylers: [{color: '#f8c967'}]
      },
      {
        featureType: 'road.highway',
        elementType: 'geometry.stroke',
        stylers: [{color: '#e9bc62'}]
      },
      {
        featureType: 'road.highway.controlled_access',
        elementType: 'geometry',
        stylers: [{color: '#e98d58'}]
      },
      {
        featureType: 'road.highway.controlled_access',
        elementType: 'geometry.stroke',
        stylers: [{color: '#db8555'}]
      },
      {
        featureType: 'road.local',
        elementType: 'labels.text.fill',
        stylers: [{color: '#806b63'}]
      },
      {
        featureType: 'transit.line',
        elementType: 'geometry',
        stylers: [{color: '#dfd2ae'}]
      },
      {
        featureType: 'transit.line',
        elementType: 'labels.text.fill',
        stylers: [{color: '#8f7d77'}]
      },
      {
        featureType: 'transit.line',
        elementType: 'labels.text.stroke',
        stylers: [{color: '#ebe3cd'}]
      },
      {
        featureType: 'transit.station',
        elementType: 'geometry',
        stylers: [{color: '#dfd2ae'}]
      },
      {
        featureType: 'water',
        elementType: 'geometry.fill',
        stylers: [{color: '#b9d3c2'}]
      },
      {
        featureType: 'water',
        elementType: 'labels.text.fill',
        stylers: [{color: '#92998d'}]
      }
    ]
  });

  infowindow = new google.maps.InfoWindow();

  map.data.loadGeoJson('dist/nfz-data.json', null, () => showInfo(map.data));
  map.data.loadGeoJson('dist/aerodromos.json', null, () => showInfo(map.data));

  map.data.setStyle((feature) => {
    const geo = feature.getGeometry()
    const type = geo.getType();

    if (type === 'Point') {
      const radius = parseInt(feature.getProperty('radius'));

      feature.circle = new google.maps.Circle({
        map: map,
        center: geo.get(),
        radius
      });

      feature.circle.addListener('click', () => clickHandler.call(feature.circle, feature.l));

      return { visible: false };
    }
  });

  function showInfo(a) {
    a.addListener('click', clickHandler);
  }
}

function clickHandler(event) {
  const position = event.feature ? event.latLng : this.center;
  const info = extractInfo(event);
  const content = formatContent(info);
  console.log(info, content)
  infowindow.setPosition(position);
  infowindow.setContent(content);
  infowindow.open(map);
}

function extractInfo(obj) {
  const properties = [
    'id',
    'name',
    'lim_sup',
    'lim_inf',
    'days',
    'hours',
    'flights_affected'
  ];
  const values = obj.hasOwnProperty('feature') ?
    properties.map(prop => obj.feature.getProperty(prop) || '') :
    properties.map(prop => obj[prop] || '');

  return values;
}

function formatContent(info) {
  return `<table>
  <tr><td><b>${info[1]}</b> (${info[0]})</td></tr>
  <tr><td>${info[3]} - ${info[2]}</td></tr>
  <tr><td>${info[4]}: ${info[5]}</td></tr>
  <tr><td>${info[6]}</td></tr>
  </table>`;
}