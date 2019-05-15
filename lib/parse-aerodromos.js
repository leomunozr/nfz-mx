#!/usr/bin/env node

/**
 * 
 * Script para leer el archivo aerodromos.csv
 * y convertirlo a formato GeoJSON
 * 
 */

const fs = require('fs');
const path = require('path');
const Coordinate = require('coordinates-converter');
const CSVToJSON = require('./csv-to-json');

const uri = path.join('docs','aerodromos.csv');

const csvFile = fs.readFileSync(uri, 'utf8');
const jsonFile = CSVToJSON(csvFile);

const features = jsonFile.map(aerodromo => {
  return {
    type: 'Feature',
    geometry: {
      type: 'Point',
      coordinates: new Coordinate(aerodromo.coordinates).toGeoJson()
    },
    properties: {
      name: aerodromo.name,
      code_dgac: aerodromo.code_dgac,
      radius: 9260, // 5 nm to m
    }
  };
});

const mapGeoJson = {
  type: 'FeatureCollection',
  features
};

const doc = JSON.stringify(mapGeoJson, null, 2);
fs.writeFileSync(path.join('src', 'dist', 'aerodromos.json'), doc);
