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

const uri = path.join('docs','helipuertos.csv');

const csvFile = fs.readFileSync(uri, 'utf8');
const jsonFile = CSVToJSON(csvFile);

const features = jsonFile
  .map(helipuerto => {
  return {
    type: 'Feature',
    geometry: {
      type: 'Point',
      coordinates: new Coordinate(helipuerto.coordinates).toGeoJson()
    },
    properties: {
      id: helipuerto.id,
      name: helipuerto.name,
      radius: 926, // 0.5 nm to m
    }
  };
});

const mapGeoJson = {
  type: 'FeatureCollection',
  features
};

const doc = JSON.stringify(mapGeoJson, null, 2);
fs.writeFileSync(path.join('src', 'dist', 'helipuertos.json'), doc);
