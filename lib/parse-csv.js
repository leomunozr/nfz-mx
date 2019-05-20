#!/usr/bin/env node

/**
 * 
 * Script para leer el archivo nfz-data.csv
 * y convertirlo a formato GeoJSON
 * 
 */

const fs = require('fs');
const path = require('path');
const Coordinate = require('coordinates-converter');
const CSVToJSON = require('./csv-to-json');

const uri = path.join('docs','nfz-data.csv');
const csv = fs.readFileSync(uri, 'utf8');
const json = CSVToJSON(csv)
const zonas = json
  .map(feature => {

    const {
      id,
      name,
      radius,
      lim_sup,
      lim_inf,
      days,
      hours,
      flights_affected
    } = feature;
    let coordinates = feature.coordinates
      .map(coord => new Coordinate(coord).toGeoJson())
      .filter(Boolean);
    const type = coordinates.length > 1 ? 'Polygon' : 'Point';
    coordinates = coordinates.length > 1 ? [coordinates] : coordinates[0];

    const zoneType = id.includes('MMP') ?
      'prohibido' : id.includes('MMR') ?
        'restringido' : 'peligroso';

    if (!coordinates) return;
  
    return {
      type: 'Feature',
      geometry: {
        type,
        coordinates
      },
      properties: {
        id,
        name,
        radius,
        lim_sup,
        lim_inf,
        days,
        hours,
        flights_affected,
        zoneType
      }
    }
  })
  .filter(z => z);

const mapGeoJson = {
  type: 'FeatureCollection',
  features: zonas
};

const doc = JSON.stringify(mapGeoJson, null, 2);

fs.writeFileSync(path.join('src', 'dist', 'nfz-data.json'), doc);
