var map;
function initMap() {
  map = new google.maps.Map(document.getElementById('map'), {
    center: { lat: 21.880591, lng: -102.296002 },
    zoom: 5
  });

  map.data.loadGeoJson('nfz-data.json');

  map.data.setStyle(function (feature) {
    const geo = feature.getGeometry()
    const type = geo.getType();

    if (type === 'Point') {
      const radius = parseInt(feature.getProperty('radius'));

      feature.circle = new google.maps.Circle({
        map: map,
        center: geo.get(),
        radius
      });

      return { visible: false };
    }
  });
}