let map;
let infowindow;

function initMap() {
  map = new google.maps.Map(document.getElementById('map'), {
    center: { lat: 21.880591, lng: -102.296002 },
    zoom: 5,
    zoomControl: true,
    mapTypeControl: false,
    scaleControl: true,
    streetViewControl: false,
    rotateControl: false,
    fullscreenControl: true
  });

  infowindow = new google.maps.InfoWindow();

  map.data.loadGeoJson('dist/nfz-data.json', null, () => showInfo(map.data));

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