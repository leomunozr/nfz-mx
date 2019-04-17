/**
 * 
 * Utilities
 * 
 * Converts csv file into json.
 * Groups all columns named c* into a single property named 'coordinates'
 *  
 */

const CSVToJSON = (data, delimiter = ',') => {
  const titles = data.slice(0, data.indexOf('\n')).split(delimiter);
  return data
    .slice(data.indexOf('\n') + 1)
    .split(/\r?\n/)
    .map(v => {
      const values = v.split(delimiter);

      return titles.reduce((obj, title, index) => {
        if (values[index]) {
          /^c\d/.test(title) ?
            obj['coordinates'].push(values[index])
            :
            obj[title.trim()] = values[index].trim();
        }
        return obj;
      }, { coordinates: [] });
    });
};

module.exports = { CSVToJSON };